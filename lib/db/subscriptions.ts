/**
 * Subscription Database Operations
 *
 * Provides database access for subscription lifecycle management, used by
 * the Stripe webhook handler and related billing flows.
 *
 * IMPORTANT: This module is server-only and cannot be imported in client components.
 */

import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./client";

/** Fields needed to create the subscription produced by a completed checkout. */
export type CheckoutSubscriptionData = Omit<
  Prisma.SubscriptionUncheckedCreateInput,
  "userId"
>;

/** Fields Stripe's subscription.updated/created events can change. */
export type StripeSubscriptionUpdate = Pick<
  Prisma.SubscriptionUncheckedUpdateInput,
  | "plan"
  | "status"
  | "priceId"
  | "interval"
  | "currentPeriodStart"
  | "currentPeriodEnd"
  | "cancelAtPeriodEnd"
  | "cancelledAt"
>;

/** Find a subscription by its Stripe subscription ID. */
export async function findSubscriptionByStripeId(stripeSubscriptionId: string) {
  return prisma.subscription.findUnique({ where: { stripeSubscriptionId } });
}

/** Find a subscription by the user it belongs to. */
export async function findSubscriptionByUserId(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

/**
 * Create or update the subscription produced by a completed Stripe checkout.
 * Idempotent: re-running the same checkout event upserts the same row.
 */
export async function upsertSubscriptionForCheckout(
  userId: string,
  data: CheckoutSubscriptionData,
) {
  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, ...data },
    update: {
      stripeSubscriptionId: data.stripeSubscriptionId,
      customerId: data.customerId,
      priceId: data.priceId,
      plan: data.plan,
      status: data.status,
      interval: data.interval,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelledAt: null,
      cancelAtPeriodEnd: false,
    },
  });
}

/**
 * Mark a user's one-time trial as used and record the Stripe trial dates.
 * Only the dates Stripe actually reported are written.
 */
export async function markUserTrialUsed(
  userId: string,
  trial: { trialStartDate?: Date; trialEndDate?: Date },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      hasUsedTrial: true,
      ...(trial.trialStartDate && { trialStartDate: trial.trialStartDate }),
      ...(trial.trialEndDate && { trialEndDate: trial.trialEndDate }),
    },
  });
}

/** Apply an update from a Stripe customer.subscription.updated/created event. */
export async function updateSubscriptionFromStripe(
  id: string,
  data: StripeSubscriptionUpdate,
) {
  return prisma.subscription.update({ where: { id }, data });
}

/** Downgrade a subscription to the free plan after Stripe deletes it. */
export async function downgradeSubscriptionToFree(id: string) {
  return prisma.subscription.update({
    where: { id },
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
}

/** Set a subscription's status directly, e.g. from an invoice payment event. */
export async function setSubscriptionStatus(id: string, status: string) {
  return prisma.subscription.update({ where: { id }, data: { status } });
}

/** Minimal contact info needed to send subscription lifecycle emails. */
export async function getUserContactInfo(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
}
