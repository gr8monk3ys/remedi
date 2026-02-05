/**
 * Free Trial Management
 *
 * Handles 7-day premium trial functionality for new users.
 * Includes trial status tracking, expiry notifications, and automatic downgrade.
 */

import { prisma } from "@/lib/db";
import {
  PLAN_LIMITS,
  type PlanType,
  type PlanLimits,
} from "@/lib/stripe-config";

// Type for Prisma transaction client
type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Trial configuration
export const TRIAL_CONFIG = {
  durationDays: 7,
  plan: "premium" as PlanType,
  features: [
    "Unlimited searches",
    "Unlimited favorites",
    "50 AI-powered searches per day",
    "Full search history",
    "Compare up to 10 remedies",
    "Export your data",
    "Priority support",
  ],
} as const;

/**
 * Trial status information
 */
export interface TrialStatus {
  isActive: boolean;
  isEligible: boolean;
  hasUsedTrial: boolean;
  startDate: Date | null;
  endDate: Date | null;
  daysRemaining: number;
  plan: PlanType;
}

/**
 * Check if a user is eligible for a free trial
 * Users are eligible if they haven't used a trial before
 */
export async function isTrialEligible(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hasUsedTrial: true },
  });

  return user !== null && !user.hasUsedTrial;
}

/**
 * Get the current trial status for a user
 */
export async function getTrialStatus(userId: string): Promise<TrialStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      hasUsedTrial: true,
      trialStartDate: true,
      trialEndDate: true,
      subscription: {
        select: { plan: true, status: true },
      },
    },
  });

  if (!user) {
    return {
      isActive: false,
      isEligible: false,
      hasUsedTrial: false,
      startDate: null,
      endDate: null,
      daysRemaining: 0,
      plan: "free",
    };
  }

  const now = new Date();
  const isActive =
    user.trialEndDate !== null &&
    user.trialEndDate > now &&
    user.subscription?.status === "trialing";

  const daysRemaining = user.trialEndDate
    ? Math.max(
        0,
        Math.ceil(
          (user.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  // Determine current plan based on trial and subscription status
  let currentPlan: PlanType = "free";
  if (user.subscription?.status === "active") {
    currentPlan = user.subscription.plan as PlanType;
  } else if (isActive) {
    currentPlan = TRIAL_CONFIG.plan;
  }

  return {
    isActive,
    isEligible: !user.hasUsedTrial,
    hasUsedTrial: user.hasUsedTrial,
    startDate: user.trialStartDate,
    endDate: user.trialEndDate,
    daysRemaining,
    plan: currentPlan,
  };
}

/**
 * Start a free trial for a user
 * Returns trial details or throws an error if not eligible
 */
export async function startTrial(userId: string): Promise<{
  success: boolean;
  trialEndDate: Date;
  daysRemaining: number;
}> {
  const isEligible = await isTrialEligible(userId);

  if (!isEligible) {
    throw new Error("User is not eligible for a free trial");
  }

  const trialStartDate = new Date();
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + TRIAL_CONFIG.durationDays);

  // Start transaction to update user and create/update subscription
  await prisma.$transaction(async (tx: TransactionClient) => {
    // Update user with trial dates
    await tx.user.update({
      where: { id: userId },
      data: {
        trialStartDate,
        trialEndDate,
        hasUsedTrial: true,
      },
    });

    // Ensure subscription record exists with trial status
    await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: TRIAL_CONFIG.plan,
        status: "trialing",
        startedAt: trialStartDate,
        expiresAt: trialEndDate,
      },
      update: {
        plan: TRIAL_CONFIG.plan,
        status: "trialing",
        expiresAt: trialEndDate,
      },
    });
  });

  return {
    success: true,
    trialEndDate,
    daysRemaining: TRIAL_CONFIG.durationDays,
  };
}

/**
 * Check and process trial expirations
 * Called by a scheduled job to downgrade expired trials
 */
export async function processExpiredTrials(): Promise<{
  processed: number;
  errors: string[];
}> {
  const now = new Date();
  const errors: string[] = [];

  // Find users with expired trials who are still on trial status
  const expiredTrials = await prisma.user.findMany({
    where: {
      trialEndDate: {
        lt: now,
      },
      subscription: {
        status: "trialing",
      },
    },
    select: {
      id: true,
      email: true,
      subscription: {
        select: { id: true },
      },
    },
  });

  let processed = 0;

  for (const user of expiredTrials) {
    try {
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            plan: "free",
            status: "active",
            expiresAt: null,
          },
        });
        processed++;
      }
    } catch (error) {
      errors.push(
        `Failed to process trial expiration for user ${user.id}: ${error}`,
      );
    }
  }

  return { processed, errors };
}

/**
 * Get the effective plan limits for a user
 * Takes into account trial status
 */
export async function getEffectivePlanLimits(userId: string): Promise<{
  limits: PlanLimits;
  plan: PlanType;
  isTrial: boolean;
}> {
  const trialStatus = await getTrialStatus(userId);

  if (trialStatus.isActive) {
    return {
      limits: PLAN_LIMITS.PREMIUM,
      plan: "premium",
      isTrial: true,
    };
  }

  // Check for paid subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });

  if (subscription?.status === "active") {
    const planKey = subscription.plan.toUpperCase() as keyof typeof PLAN_LIMITS;
    return {
      limits: PLAN_LIMITS[planKey] || PLAN_LIMITS.FREE,
      plan: subscription.plan as PlanType,
      isTrial: false,
    };
  }

  return {
    limits: PLAN_LIMITS.FREE,
    plan: "free",
    isTrial: false,
  };
}

/**
 * Get users whose trials are expiring soon (within specified days)
 * Used for sending reminder emails
 */
export async function getExpiringTrials(withinDays: number = 2): Promise<
  Array<{
    userId: string;
    email: string;
    name: string | null;
    trialEndDate: Date;
    daysRemaining: number;
  }>
> {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + withinDays);

  const users = await prisma.user.findMany({
    where: {
      trialEndDate: {
        gt: now,
        lte: futureDate,
      },
      subscription: {
        status: "trialing",
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      trialEndDate: true,
    },
  });

  return users.map(
    (user: {
      id: string;
      email: string;
      name: string | null;
      trialEndDate: Date | null;
    }) => ({
      userId: user.id,
      email: user.email,
      name: user.name,
      trialEndDate: user.trialEndDate!,
      daysRemaining: Math.ceil(
        (user.trialEndDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }),
  );
}

/**
 * Cancel an active trial (revert to free plan)
 */
export async function cancelTrial(userId: string): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      plan: "free",
      status: "active",
      expiresAt: null,
    },
  });
}
