/**
 * Clerk Webhook Handler
 *
 * Syncs Clerk user events to the Prisma database.
 * Handles user.created, user.updated, and user.deleted events.
 *
 * Also stores the DB user ID and role in Clerk publicMetadata
 * so client components can access them without extra API calls.
 *
 * Triggers welcome email on user.created via the email service.
 *
 * @see https://clerk.com/docs/webhooks/overview
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { sendWelcomeEmail } from "@/lib/email";
import { createLogger } from "@/lib/logger";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const logger = createLogger("webhook-clerk");

/**
 * Stop billing someone whose account has just been erased.
 *
 * Deleting the User cascades the Subscription row away, so before this existed
 * the Stripe subscription and customer simply outlived the account: still
 * billing, with nothing local left that could notice. reconcile-subscriptions
 * iterates our own rows, so it could not catch it either. Someone exercised
 * their right to erasure and kept being charged.
 *
 * Cancelled immediately rather than at period end. `cancelSubscription()` in
 * lib/stripe sets cancel_at_period_end, which is right when a user chooses to
 * leave and wants what they paid for; it is wrong here, because the account
 * they would use it with no longer exists. Whether the unused remainder is
 * refunded is a policy decision and is deliberately not made here.
 *
 * Erasure must not be blocked by a billing failure — the deletion is a legal
 * obligation and Stripe being unreachable does not suspend it. So a failure is
 * recorded durably in the WebhookEvent ledger instead of thrown, giving an
 * operator a row to act on rather than a log line that scrolls away.
 */
async function cancelSubscriptionOnErasure(
  clerkId: string,
  stripeSubscriptionId: string | null,
): Promise<void> {
  if (!stripeSubscriptionId) return;

  if (!isStripeConfigured()) {
    logger.error(
      "Account erased with an active Stripe subscription, but Stripe is not configured to cancel it",
      { clerkId, stripeSubscriptionId },
    );
    return;
  }

  try {
    await getStripe().subscriptions.cancel(stripeSubscriptionId);
    logger.info("Cancelled Stripe subscription for an erased account", {
      clerkId,
      stripeSubscriptionId,
    });
    return;
  } catch (error) {
    // Already gone is the outcome we wanted, not a failure.
    const code = (error as { code?: string } | null)?.code;
    if (code === "resource_missing") {
      logger.info("Stripe subscription already absent for an erased account", {
        clerkId,
        stripeSubscriptionId,
      });
      return;
    }

    logger.error("Failed to cancel Stripe subscription for an erased account", {
      clerkId,
      stripeSubscriptionId,
      error,
    });

    // A person is still being billed for an account that no longer exists.
    // That belongs somewhere an operator will find it.
    try {
      await prisma.webhookEvent.upsert({
        where: { stripeEventId: `clerk:user.deleted:${clerkId}` },
        create: {
          stripeEventId: `clerk:user.deleted:${clerkId}`,
          type: "clerk.user.deleted.subscription_cancel_failed",
          payload: { clerkId, stripeSubscriptionId },
          status: "failed",
          attempts: 1,
          lastError: error instanceof Error ? error.message : String(error),
        },
        update: {
          status: "failed",
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : String(error),
        },
      });
    } catch (ledgerError) {
      logger.error("Could not record the failed cancellation either", {
        clerkId,
        stripeSubscriptionId,
        error: ledgerError,
      });
    }
  }
}

export async function POST(req: Request): Promise<Response> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Server configuration error", { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error("Webhook verification failed", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  // Handle events
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      return new Response("No email address found", { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    // Check if a user with this email already exists (migration from NextAuth)
    const existingUser = await prisma.user.findUnique({
      where: { email: primaryEmail },
    });

    let dbUser;
    if (existingUser) {
      // Link existing user to their Clerk account
      dbUser = await prisma.user.update({
        where: { email: primaryEmail },
        data: {
          clerkId: id,
          name: name || existingUser.name,
          image: image_url || existingUser.image,
        },
      });
    } else {
      // Create a new user record
      dbUser = await prisma.user.create({
        data: {
          clerkId: id,
          email: primaryEmail,
          name,
          image: image_url,
          role: "user",
        },
      });
    }

    // Sync role and dbUserId to Clerk publicMetadata for client-side access
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(id, {
      publicMetadata: {
        role: dbUser.role,
        dbUserId: dbUser.id,
      },
    });

    // Create default email preferences for the new user
    try {
      await prisma.emailPreference.upsert({
        where: { userId: dbUser.id },
        update: {},
        create: {
          userId: dbUser.id,
          weeklyDigest: true,
          marketingEmails: false,
          productUpdates: true,
          subscriptionReminders: true,
        },
      });
    } catch (prefError) {
      // Non-critical: do not fail the webhook if preference creation fails
      logger.error("Failed to create email preferences", prefError);
    }

    // Send welcome email via the email service (handles logging, preference
    // checking, and graceful degradation if Resend is not configured)
    try {
      await sendWelcomeEmail(primaryEmail, name || "there", dbUser.id);
    } catch (emailError) {
      // Do not fail the webhook if email sending fails
      logger.error("Failed to send welcome email", emailError);
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || undefined;

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: id },
    });

    if (dbUser) {
      const updated = await prisma.user.update({
        where: { clerkId: id },
        data: {
          name: name || undefined,
          image: image_url || undefined,
          email: primaryEmail || undefined,
        },
      });

      // Keep publicMetadata in sync
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(id, {
        publicMetadata: {
          role: updated.role,
          dbUserId: updated.id,
        },
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: id },
        select: {
          id: true,
          // Read before the delete, not after: Subscription cascades from User
          // (schema.prisma), so once the rows are gone there is nothing left
          // that knows this person had a Stripe subscription at all — not even
          // the reconcile-subscriptions cron, which iterates our own rows.
          subscription: { select: { stripeSubscriptionId: true } },
        },
      });

      if (dbUser) {
        await cancelSubscriptionOnErasure(
          id,
          dbUser.subscription?.stripeSubscriptionId ?? null,
        );

        // Explicitly delete rows that will not cascade (onDelete: SetNull or no relation).
        // This keeps user-deleted behavior privacy-friendly.
        await prisma.$transaction([
          prisma.favorite.deleteMany({ where: { userId: dbUser.id } }),
          prisma.searchHistory.deleteMany({ where: { userId: dbUser.id } }),
          prisma.filterPreference.deleteMany({ where: { userId: dbUser.id } }),
          prisma.userEvent.deleteMany({ where: { userId: dbUser.id } }),
          prisma.conversionEvent.deleteMany({ where: { userId: dbUser.id } }),
          prisma.emailLog.deleteMany({ where: { userId: dbUser.id } }),
          prisma.user.deleteMany({ where: { clerkId: id } }),
        ]);
      } else {
        // If the DB user record was already removed, ensure we still delete by clerkId.
        await prisma.user.deleteMany({
          where: { clerkId: id },
        });
      }
    }
  }

  return new Response("OK", { status: 200 });
}
