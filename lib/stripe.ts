/**
 * Stripe Server Utilities
 *
 * Provides Stripe client initialization and helper functions
 * for subscription management.
 *
 * IMPORTANT: This module is server-only (uses STRIPE_SECRET_KEY).
 * For client-safe config (PLANS, types), use `lib/stripe-config.ts` instead.
 */

import "server-only";
import Stripe from "stripe";

// Re-export client-safe config for convenience in server code
export {
  PLANS,
  PLAN_LIMITS,
  type PlanType,
  type PlanLimits,
  getPlanLimits,
  isWithinLimit,
  getUsagePercentage,
  isPlanFeatureAvailable,
  getPlanLimit,
  parsePlanType,
} from "./stripe-config";

import { type PlanType } from "./stripe-config";

// Lazy-initialized Stripe client (avoids build-time errors)
let stripeInstance: Stripe | null = null;

/**
 * Get the Stripe client (lazy initialization)
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// Backward compatibility - use getter
export const stripe = {
  get customers() {
    return getStripe().customers;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get billingPortal() {
    return getStripe().billingPortal;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

/**
 * Price IDs configuration (server-only)
 * These are populated from environment variables
 */
export const PRICE_IDS = {
  basic: {
    monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
  },
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  },
} as const;

/**
 * Get plan by Stripe price ID
 */
export function getPlanByPriceId(priceId: string): PlanType | null {
  if (
    priceId === PRICE_IDS.basic.monthly ||
    priceId === PRICE_IDS.basic.yearly
  ) {
    return "basic";
  }
  if (
    priceId === PRICE_IDS.premium.monthly ||
    priceId === PRICE_IDS.premium.yearly
  ) {
    return "premium";
  }
  return null;
}

/**
 * Get price ID for a plan
 */
export function getPriceId(
  plan: "basic" | "premium",
  interval: "monthly" | "yearly",
): string | undefined {
  return PRICE_IDS[plan][interval];
}

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string,
): Promise<string> {
  // First, check if we already have a customer ID stored
  const { prisma } = await import("@/lib/db");
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { customerId: true },
  });

  if (subscription?.customerId) {
    return subscription.customerId;
  }

  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    const customerId = existingCustomers.data[0].id;

    // Store the customer ID
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        customerId,
        plan: "free",
        status: "active",
      },
      update: { customerId },
    });

    return customerId;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });

  // Store the customer ID
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      customerId: customer.id,
      plan: "free",
      status: "active",
    },
    update: { customerId: customer.id },
  });

  return customer.id;
}

/**
 * Create a checkout session for a subscription
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  successUrl,
  cancelUrl,
  trialPeriodDays,
}: {
  customerId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
}): Promise<Stripe.Checkout.Session> {
  const subscriptionData: Stripe.Checkout.SessionCreateParams["subscription_data"] =
    {
      metadata: { userId },
    };

  // Add trial period if specified
  if (trialPeriodDays && trialPeriodDays > 0) {
    subscriptionData.trial_period_days = trialPeriodDays;
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: subscriptionData,
    metadata: { userId },
  });
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return (
    !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PUBLISHABLE_KEY
  );
}

export type StripeMode = "test" | "live" | "unknown";

/**
 * Infer Stripe key mode from the configured secret/publishable keys.
 *
 * This is safe to expose in admin tooling since it does not reveal the key.
 */
export function getStripeMode(): StripeMode {
  const secret = process.env.STRIPE_SECRET_KEY || "";
  const publishable = process.env.STRIPE_PUBLISHABLE_KEY || "";

  if (secret.startsWith("sk_test_") || publishable.startsWith("pk_test_")) {
    return "test";
  }
  if (secret.startsWith("sk_live_") || publishable.startsWith("pk_live_")) {
    return "live";
  }
  return "unknown";
}

export type StripeInvoiceSummary = {
  id: string;
  number: string | null;
  status: Stripe.Invoice.Status | null;
  currency: string;
  amountDue: number;
  amountPaid: number;
  created: number;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  periodStart: number | null;
  periodEnd: number | null;
};

/**
 * List recent invoices for a Stripe customer.
 *
 * Note: amounts are returned in the smallest currency unit (e.g. cents).
 */
export async function listCustomerInvoices(
  customerId: string,
  { limit = 10 }: { limit?: number } = {},
): Promise<StripeInvoiceSummary[]> {
  const invoices = await getStripe().invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number ?? null,
    status: inv.status ?? null,
    currency: inv.currency,
    amountDue: inv.amount_due,
    amountPaid: inv.amount_paid,
    created: inv.created,
    hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    invoicePdf: inv.invoice_pdf ?? null,
    periodStart: inv.period_start ?? null,
    periodEnd: inv.period_end ?? null,
  }));
}

/**
 * Extracts billing period dates from a Stripe subscription.
 * Tries subscription-level dates first (Stripe API v2023-10-16+),
 * then first item dates, then returns null for both.
 */
// Stripe SDK types don't expose these fields uniformly across API versions
type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
};
type SubscriptionItemWithPeriod = Stripe.SubscriptionItem & {
  current_period?: { start?: number; end?: number };
};

export function extractBillingPeriod(subscription: Stripe.Subscription): {
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
} {
  // Subscription-level billing period (Stripe API v2023-10-16+)
  const sub = subscription as SubscriptionWithPeriod;
  if (sub.current_period_start && sub.current_period_end) {
    return {
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    };
  }

  // Item-level billing period fallback
  const item = subscription.items?.data?.[0] as
    | SubscriptionItemWithPeriod
    | undefined;
  const period = item?.current_period;
  if (period?.start && period?.end) {
    return {
      currentPeriodStart: new Date(period.start * 1000),
      currentPeriodEnd: new Date(period.end * 1000),
    };
  }

  return { currentPeriodStart: null, currentPeriodEnd: null };
}
