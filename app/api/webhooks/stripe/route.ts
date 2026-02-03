/**
 * Stripe Webhook Handler
 *
 * Processes Stripe webhook events for subscription management.
 * Handles subscription creation, updates, cancellation, and payment events.
 *
 * POST /api/webhooks/stripe
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe, getPlanByPriceId, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import {
  sendSubscriptionConfirmation,
  sendSubscriptionCancelled,
} from "@/lib/email";

const log = createLogger("stripe-webhook");

// Disable body parsing for webhook signature verification
export const runtime = "nodejs";

/**
 * Verify Stripe webhook signature
 */
async function verifyWebhookSignature(
  body: string,
  signature: string,
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Handle checkout.session.completed event
 * Idempotent: checks if subscription already exists before creating
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.userId;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!userId || !subscriptionId) {
    log.error("Missing userId or subscriptionId in session", null, {
      sessionId: session.id,
    });
    return;
  }

  // Idempotency check: skip if already processed
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (existing && existing.status === "active") {
    log.info("Subscription already processed, skipping", { subscriptionId });
    return;
  }

  // Get subscription details from Stripe
  const stripeSubscription =
    await stripe.subscriptions.retrieve(subscriptionId);
  const subscriptionItem = stripeSubscription.items.data[0];
  const priceId = subscriptionItem?.price.id;
  const plan = priceId ? getPlanByPriceId(priceId) : "basic";

  // Access billing period from subscription item (Stripe v20+ types)
  const currentPeriodStart = subscriptionItem?.current_period_start
    ? new Date(subscriptionItem.current_period_start * 1000)
    : new Date();
  const currentPeriodEnd = subscriptionItem?.current_period_end
    ? new Date(subscriptionItem.current_period_end * 1000)
    : new Date();

  // Update subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: subscriptionId,
      customerId,
      priceId,
      plan: plan || "basic",
      status: "active",
      interval: subscriptionItem?.price.recurring?.interval || "month",
      currentPeriodStart,
      currentPeriodEnd,
      startedAt: new Date(
        (stripeSubscription.start_date ?? Date.now() / 1000) * 1000,
      ),
    },
    update: {
      stripeSubscriptionId: subscriptionId,
      customerId,
      priceId,
      plan: plan || "basic",
      status: "active",
      interval: subscriptionItem?.price.recurring?.interval || "month",
      currentPeriodStart,
      currentPeriodEnd,
      cancelledAt: null,
      cancelAtPeriodEnd: false,
    },
  });

  log.info("Subscription created", {
    userId,
    subscriptionId,
    plan: plan || "basic",
  });

  // Send confirmation email (fire and forget - don't fail webhook if email fails)
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (user?.email) {
      const planKey = (plan || "basic") as keyof typeof PLANS;
      const planConfig = PLANS[planKey];
      const interval = subscriptionItem?.price.recurring?.interval || "month";

      await sendSubscriptionConfirmation(
        user.email,
        {
          name: user.name || "there",
          plan: planConfig.name,
          interval: interval === "year" ? "yearly" : "monthly",
          price: `$${interval === "year" ? (planConfig as typeof PLANS.basic).yearlyPrice : planConfig.price}`,
          nextBillingDate: currentPeriodEnd.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
        userId,
      );
      log.info("Subscription confirmation email sent", { userId });
    }
  } catch (emailError) {
    // Log but don't fail the webhook
    log.error("Failed to send subscription confirmation email", emailError, {
      userId,
    });
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const subscriptionId = subscription.id;

  // Find subscription by Stripe subscription ID if no userId in metadata
  let dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription && userId) {
    dbSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });
  }

  if (!dbSubscription) {
    log.warn("No subscription found", { subscriptionId });
    return;
  }

  const subscriptionItem = subscription.items.data[0];
  const priceId = subscriptionItem?.price.id;
  const plan = priceId ? getPlanByPriceId(priceId) : dbSubscription.plan;

  // Access billing period from subscription item (Stripe v20+ types)
  const currentPeriodStart = subscriptionItem?.current_period_start
    ? new Date(subscriptionItem.current_period_start * 1000)
    : dbSubscription.currentPeriodStart;
  const currentPeriodEnd = subscriptionItem?.current_period_end
    ? new Date(subscriptionItem.current_period_end * 1000)
    : dbSubscription.currentPeriodEnd;

  // Map Stripe status to our status
  let status: string = dbSubscription.status;
  switch (subscription.status) {
    case "active":
      status = "active";
      break;
    case "canceled":
      status = "cancelled";
      break;
    case "past_due":
    case "unpaid":
      status = "expired";
      break;
    case "paused":
      status = "suspended";
      break;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      plan: plan || dbSubscription.plan,
      status,
      priceId,
      interval:
        subscriptionItem?.price.recurring?.interval || dbSubscription.interval,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  });

  log.info("Subscription updated", {
    subscriptionId,
    status,
    plan: plan || dbSubscription.plan,
  });
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) {
    log.warn("No subscription found", { subscriptionId });
    return;
  }

  // Downgrade to free plan
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      plan: "free",
      status: "cancelled",
      stripeSubscriptionId: null,
      priceId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      expiresAt: new Date(),
      cancelledAt: new Date(),
    },
  });

  log.info("Subscription deleted", { subscriptionId });

  // Send cancellation email (fire and forget - don't fail webhook if email fails)
  try {
    const user = await prisma.user.findUnique({
      where: { id: dbSubscription.userId },
      select: { email: true, name: true },
    });

    if (user?.email) {
      // Get the previous plan name for the email
      const previousPlanKey = dbSubscription.plan as keyof typeof PLANS;
      const previousPlan = PLANS[previousPlanKey] || PLANS.basic;

      // Access until is the end of the current period (already passed or now)
      const accessUntil = dbSubscription.currentPeriodEnd
        ? dbSubscription.currentPeriodEnd.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

      await sendSubscriptionCancelled(
        user.email,
        {
          name: user.name || "there",
          plan: previousPlan.name,
          accessUntil,
        },
        dbSubscription.userId,
      );
      log.info("Subscription cancellation email sent", {
        userId: dbSubscription.userId,
      });
    }
  } catch (emailError) {
    // Log but don't fail the webhook
    log.error("Failed to send subscription cancellation email", emailError, {
      userId: dbSubscription.userId,
    });
  }
}

/**
 * Extract subscription ID from invoice (handles both string ID and expanded object)
 */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  // In Stripe v20, subscription is accessed via invoice.parent.subscription_details
  const subscriptionDetails = invoice.parent?.subscription_details;
  if (!subscriptionDetails) return null;

  const subscription = subscriptionDetails.subscription;
  if (typeof subscription === "string") {
    return subscription;
  }
  return subscription?.id || null;
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

  if (!subscriptionId) return;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (dbSubscription) {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: "active",
      },
    });
  }

  log.info("Payment succeeded", { subscriptionId });
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

  if (!subscriptionId) return;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (dbSubscription) {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: "expired",
      },
    });
  }

  log.warn("Payment failed", { subscriptionId });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await verifyWebhookSignature(body, signature);
    } catch (err) {
      log.error("Signature verification failed", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        log.debug("Unhandled event type", { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    log.error("Error processing webhook", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
