/**
 * What happens around a user account being created or erased.
 *
 * Called from Better Auth's hooks in lib/better-auth.ts.
 */

import "server-only";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { createLogger } from "@/lib/logger";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const logger = createLogger("account-lifecycle");

/** Default email preferences and the welcome email for a new account. */
export async function onUserCreated(user: {
  id: string;
  email: string;
  name: string | null;
}): Promise<void> {
  try {
    await prisma.emailPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        weeklyDigest: true,
        marketingEmails: false,
        productUpdates: true,
        subscriptionReminders: true,
      },
    });
  } catch (prefError) {
    // Non-critical: lib/email treats a missing preference row as the defaults.
    logger.error("Failed to create email preferences", prefError);
  }

  // sendWelcomeEmail logs and returns failures itself rather than throwing.
  await sendWelcomeEmail(user.email, user.name || "there", user.id);
}

/**
 * Stop billing someone whose account is being erased.
 *
 * Deleting the User cascades the Subscription row away, so without this the
 * Stripe subscription and customer outlive the account: still billing, with
 * nothing local left that could notice. reconcile-subscriptions iterates our
 * own rows, so it could not catch it either.
 *
 * Cancelled immediately rather than at period end. `cancelSubscription()` in
 * lib/stripe sets cancel_at_period_end, which is right when a user chooses to
 * leave and wants what they paid for; it is wrong here, because the account
 * they would use it with no longer exists.
 *
 * Erasure must not be blocked by a billing failure — the deletion is a legal
 * obligation and Stripe being unreachable does not suspend it. So a failure is
 * recorded durably in the WebhookEvent ledger instead of thrown, giving an
 * operator a row to act on rather than a log line that scrolls away.
 */
async function cancelSubscriptionOnErasure(
  userId: string,
  stripeSubscriptionId: string | null,
): Promise<void> {
  if (!stripeSubscriptionId) return;

  if (!isStripeConfigured()) {
    logger.error(
      "Account erased with an active Stripe subscription, but Stripe is not configured to cancel it",
      { userId, stripeSubscriptionId },
    );
    return;
  }

  try {
    await getStripe().subscriptions.cancel(stripeSubscriptionId);
    logger.info("Cancelled Stripe subscription for an erased account", {
      userId,
      stripeSubscriptionId,
    });
    return;
  } catch (error) {
    // Already gone is the outcome we wanted, not a failure.
    const code = (error as { code?: string } | null)?.code;
    if (code === "resource_missing") {
      logger.info("Stripe subscription already absent for an erased account", {
        userId,
        stripeSubscriptionId,
      });
      return;
    }

    logger.error("Failed to cancel Stripe subscription for an erased account", {
      userId,
      stripeSubscriptionId,
      error,
    });

    try {
      await prisma.webhookEvent.upsert({
        where: { stripeEventId: `account:deleted:${userId}` },
        create: {
          stripeEventId: `account:deleted:${userId}`,
          type: "account.deleted.subscription_cancel_failed",
          payload: { userId, stripeSubscriptionId },
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
        userId,
        stripeSubscriptionId,
        error: ledgerError,
      });
    }
  }
}

/**
 * Erase what deleting the User row would not.
 *
 * Runs before Better Auth deletes the user, which cascades everything with
 * `onDelete: Cascade`. The rows removed here are `SetNull` or unrelated, so
 * they would otherwise survive the account as orphaned personal data.
 */
export async function eraseUserData(userId: string): Promise<void> {
  // Read before the delete: Subscription cascades from User, so once the row
  // is gone nothing knows this person had a Stripe subscription at all.
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeSubscriptionId: true },
  });

  await cancelSubscriptionOnErasure(
    userId,
    subscription?.stripeSubscriptionId ?? null,
  );

  await prisma.$transaction([
    prisma.favorite.deleteMany({ where: { userId } }),
    prisma.searchHistory.deleteMany({ where: { userId } }),
    prisma.filterPreference.deleteMany({ where: { userId } }),
    prisma.userEvent.deleteMany({ where: { userId } }),
    prisma.conversionEvent.deleteMany({ where: { userId } }),
    prisma.emailLog.deleteMany({ where: { userId } }),
  ]);
}
