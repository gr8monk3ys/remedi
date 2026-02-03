/**
 * Usage Tracking Module
 *
 * Tracks daily usage metrics for plan limit enforcement.
 * Stores usage data in the database for accurate cross-device tracking.
 */

import { prisma } from "@/lib/db";
import {
  getPlanLimits,
  getUsagePercentage,
  isWithinLimit,
  type PlanType,
} from "@/lib/stripe-config";
import { getTrialStatus } from "@/lib/trial";

/**
 * Usage types that are tracked
 */
export type UsageType = "searches" | "aiSearches" | "exports" | "comparisons";

/**
 * Daily usage record
 */
export interface DailyUsage {
  searches: number;
  aiSearches: number;
  exports: number;
  comparisons: number;
  date: Date;
}

/**
 * Usage summary with limits
 */
export interface UsageSummary {
  plan: PlanType;
  isTrial: boolean;
  searches: {
    used: number;
    limit: number;
    percentage: number;
    isWithinLimit: boolean;
  };
  aiSearches: {
    used: number;
    limit: number;
    percentage: number;
    isWithinLimit: boolean;
  };
  favorites: {
    used: number;
    limit: number;
    percentage: number;
    isWithinLimit: boolean;
  };
  comparisons: {
    used: number;
    limit: number;
    percentage: number;
    isWithinLimit: boolean;
  };
}

/**
 * Get today's date in UTC (start of day)
 */
function getTodayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/**
 * Get or create today's usage record for a user
 */
async function getOrCreateTodayUsage(userId: string): Promise<DailyUsage> {
  const today = getTodayUTC();

  const existing = await prisma.usageRecord.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  if (existing) {
    return {
      searches: existing.searches,
      aiSearches: existing.aiSearches,
      exports: existing.exports,
      comparisons: existing.comparisons,
      date: existing.date,
    };
  }

  // Create new record for today
  const newRecord = await prisma.usageRecord.create({
    data: {
      userId,
      date: today,
      searches: 0,
      aiSearches: 0,
      exports: 0,
      comparisons: 0,
    },
  });

  return {
    searches: newRecord.searches,
    aiSearches: newRecord.aiSearches,
    exports: newRecord.exports,
    comparisons: newRecord.comparisons,
    date: newRecord.date,
  };
}

/**
 * Get today's usage for a user
 */
export async function getTodayUsage(userId: string): Promise<DailyUsage> {
  return getOrCreateTodayUsage(userId);
}

/**
 * Increment a usage counter for today
 * Returns the new usage count and whether the limit was exceeded
 */
export async function incrementUsage(
  userId: string,
  type: UsageType,
  amount: number = 1,
): Promise<{
  newCount: number;
  wasWithinLimit: boolean;
  isNowWithinLimit: boolean;
}> {
  const today = getTodayUTC();

  // Get current plan limits
  const trialStatus = await getTrialStatus(userId);
  let plan: PlanType = "free";

  if (trialStatus.isActive) {
    plan = "premium";
  } else {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    });
    if (subscription?.status === "active") {
      plan = subscription.plan as PlanType;
    }
  }

  const limits = getPlanLimits(plan);
  const limitKey =
    type === "searches"
      ? "maxSearchesPerDay"
      : type === "aiSearches"
        ? "maxAiSearchesPerDay"
        : type === "comparisons"
          ? "maxCompareItems"
          : "maxSearchesPerDay"; // exports use searches limit

  const limit = limits[limitKey];

  // Upsert usage record and increment counter
  const updated = await prisma.usageRecord.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    create: {
      userId,
      date: today,
      [type]: amount,
    },
    update: {
      [type]: {
        increment: amount,
      },
    },
  });

  const previousCount = (updated[type] as number) - amount;
  const newCount = updated[type] as number;

  return {
    newCount,
    wasWithinLimit: isWithinLimit(limit, previousCount),
    isNowWithinLimit: isWithinLimit(limit, newCount),
  };
}

/**
 * Check if a user can perform an action (is within limit)
 */
export async function canPerformAction(
  userId: string,
  type: UsageType,
): Promise<{
  allowed: boolean;
  currentUsage: number;
  limit: number;
  plan: PlanType;
}> {
  const usage = await getTodayUsage(userId);
  const trialStatus = await getTrialStatus(userId);

  let plan: PlanType = "free";
  if (trialStatus.isActive) {
    plan = "premium";
  } else {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    });
    if (subscription?.status === "active") {
      plan = subscription.plan as PlanType;
    }
  }

  const limits = getPlanLimits(plan);
  const currentUsage = usage[type];

  const limitKey =
    type === "searches"
      ? "maxSearchesPerDay"
      : type === "aiSearches"
        ? "maxAiSearchesPerDay"
        : type === "comparisons"
          ? "maxCompareItems"
          : "maxSearchesPerDay";

  const limit = limits[limitKey];

  return {
    allowed: isWithinLimit(limit, currentUsage),
    currentUsage,
    limit,
    plan,
  };
}

/**
 * Get comprehensive usage summary for a user
 */
export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const usage = await getTodayUsage(userId);
  const trialStatus = await getTrialStatus(userId);

  let plan: PlanType = "free";
  let isTrial = false;

  if (trialStatus.isActive) {
    plan = "premium";
    isTrial = true;
  } else {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    });
    if (subscription?.status === "active") {
      plan = subscription.plan as PlanType;
    }
  }

  const limits = getPlanLimits(plan);

  // Get favorites count
  const favoritesCount = await prisma.favorite.count({
    where: { userId },
  });

  return {
    plan,
    isTrial,
    searches: {
      used: usage.searches,
      limit: limits.maxSearchesPerDay,
      percentage: getUsagePercentage(limits.maxSearchesPerDay, usage.searches),
      isWithinLimit: isWithinLimit(limits.maxSearchesPerDay, usage.searches),
    },
    aiSearches: {
      used: usage.aiSearches,
      limit: limits.maxAiSearchesPerDay,
      percentage: getUsagePercentage(
        limits.maxAiSearchesPerDay,
        usage.aiSearches,
      ),
      isWithinLimit: isWithinLimit(
        limits.maxAiSearchesPerDay,
        usage.aiSearches,
      ),
    },
    favorites: {
      used: favoritesCount,
      limit: limits.maxFavorites,
      percentage: getUsagePercentage(limits.maxFavorites, favoritesCount),
      isWithinLimit: isWithinLimit(limits.maxFavorites, favoritesCount),
    },
    comparisons: {
      used: usage.comparisons,
      limit: limits.maxCompareItems,
      percentage: getUsagePercentage(limits.maxCompareItems, usage.comparisons),
      isWithinLimit: isWithinLimit(limits.maxCompareItems, usage.comparisons),
    },
  };
}

/**
 * Get usage history for the past N days
 */
export async function getUsageHistory(
  userId: string,
  days: number = 30,
): Promise<DailyUsage[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setUTCHours(0, 0, 0, 0);

  const records = await prisma.usageRecord.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
      },
    },
    orderBy: { date: "desc" },
  });

  return records.map(
    (r: {
      searches: number;
      aiSearches: number;
      exports: number;
      comparisons: number;
      date: Date;
    }) => ({
      searches: r.searches,
      aiSearches: r.aiSearches,
      exports: r.exports,
      comparisons: r.comparisons,
      date: r.date,
    }),
  );
}

/**
 * Reset daily usage (for testing/admin purposes)
 */
export async function resetDailyUsage(userId: string): Promise<void> {
  const today = getTodayUTC();

  await prisma.usageRecord.deleteMany({
    where: {
      userId,
      date: today,
    },
  });
}

/**
 * Get aggregate usage statistics for a user
 */
export async function getAggregateUsage(
  userId: string,
  days: number = 30,
): Promise<{
  totalSearches: number;
  totalAiSearches: number;
  totalExports: number;
  totalComparisons: number;
  averageSearchesPerDay: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setUTCHours(0, 0, 0, 0);

  const aggregate = await prisma.usageRecord.aggregate({
    where: {
      userId,
      date: {
        gte: startDate,
      },
    },
    _sum: {
      searches: true,
      aiSearches: true,
      exports: true,
      comparisons: true,
    },
    _count: true,
  });

  const totalSearches = aggregate._sum.searches || 0;
  const recordCount = aggregate._count || 1;

  return {
    totalSearches,
    totalAiSearches: aggregate._sum.aiSearches || 0,
    totalExports: aggregate._sum.exports || 0,
    totalComparisons: aggregate._sum.comparisons || 0,
    averageSearchesPerDay: Math.round(totalSearches / recordCount),
  };
}
