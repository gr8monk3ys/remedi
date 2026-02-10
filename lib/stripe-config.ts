/**
 * Stripe Configuration (Client-Safe)
 *
 * Contains plan configurations and types that can be safely
 * imported in both client and server components.
 *
 * For server-only Stripe operations, use `lib/stripe.ts` instead.
 */

/**
 * Plan limits configuration
 * Defines feature access and usage limits for each plan tier
 */
export const PLAN_LIMITS = {
  FREE: {
    maxFavorites: 3,
    maxSearchesPerDay: 5,
    maxAiSearchesPerDay: 0,
    canExport: false,
    canCompare: false,
    maxCompareItems: 0,
    canAccessHistory: false,
    prioritySupport: false,
    // Subscription-justifying features
    maxMedications: 3,
    canViewCabinetInteractions: false,
    hasPersonalizedSearch: false,
    canTrackJournal: false,
    maxReportsPerMonth: 0,
  },
  BASIC: {
    maxFavorites: 50,
    maxSearchesPerDay: 100,
    maxAiSearchesPerDay: 10,
    canExport: true,
    canCompare: true,
    maxCompareItems: 4,
    canAccessHistory: true,
    prioritySupport: false,
    // Subscription-justifying features
    maxMedications: 20,
    canViewCabinetInteractions: true,
    hasPersonalizedSearch: true,
    canTrackJournal: true,
    maxReportsPerMonth: 2,
  },
  PREMIUM: {
    maxFavorites: -1, // Unlimited
    maxSearchesPerDay: -1, // Unlimited
    maxAiSearchesPerDay: 50,
    canExport: true,
    canCompare: true,
    maxCompareItems: 10,
    canAccessHistory: true,
    prioritySupport: true,
    // Subscription-justifying features
    maxMedications: -1, // Unlimited
    canViewCabinetInteractions: true,
    hasPersonalizedSearch: true,
    canTrackJournal: true,
    maxReportsPerMonth: -1, // Unlimited
  },
} as const;

export type PlanLimits = (typeof PLAN_LIMITS)[keyof typeof PLAN_LIMITS];

/**
 * Get plan limits by plan type
 */
export function getPlanLimits(plan: PlanType): PlanLimits {
  const planKey = plan.toUpperCase() as keyof typeof PLAN_LIMITS;
  return PLAN_LIMITS[planKey] || PLAN_LIMITS.FREE;
}

/**
 * Check if a usage value is within the plan limit
 * Returns true if the usage is allowed, false if limit is exceeded
 */
export function isWithinLimit(limit: number, currentUsage: number): boolean {
  return limit === -1 || currentUsage < limit;
}

/**
 * Calculate usage percentage (0-100)
 * Returns 0 for unlimited plans
 */
export function getUsagePercentage(
  limit: number,
  currentUsage: number,
): number {
  if (limit === -1) return 0;
  if (limit === 0) return 100;
  return Math.min(100, Math.round((currentUsage / limit) * 100));
}

/**
 * Subscription plan configuration
 *
 * Note: Price IDs are only populated server-side from environment variables.
 * Client-side code should not access monthlyPriceId/yearlyPriceId directly.
 */
export const PLANS = {
  free: {
    name: "Free",
    description: "Get started with basic natural remedy search",
    price: 0,
    features: [
      "5 searches per day",
      "Save up to 3 favorites",
      "Health profile (categories & goals)",
      "3 medications in cabinet",
      "Generic weekly digest",
    ],
    limits: {
      favorites: PLAN_LIMITS.FREE.maxFavorites,
      searchesPerDay: PLAN_LIMITS.FREE.maxSearchesPerDay,
      aiSearches: PLAN_LIMITS.FREE.maxAiSearchesPerDay,
    },
  },
  basic: {
    name: "Basic",
    description: "Personalized health tracking & insights",
    price: 9.99,
    yearlyPrice: 95.9, // 20% off annual (saves $24)
    features: [
      "100 searches per day",
      "10 AI-powered searches per day",
      "Full health profile with conditions & allergies",
      "20 medications with auto-interaction alerts",
      "Personalized search results",
      "Remedy tracking journal with charts",
      "2 AI remedy reports per month",
      "Personalized weekly digest",
      "50 favorites, compare & export",
      "Full search history",
    ],
    limits: {
      favorites: PLAN_LIMITS.BASIC.maxFavorites,
      searchesPerDay: PLAN_LIMITS.BASIC.maxSearchesPerDay,
      aiSearches: PLAN_LIMITS.BASIC.maxAiSearchesPerDay,
    },
  },
  premium: {
    name: "Premium",
    description: "Unlimited AI-powered health intelligence",
    price: 19.99,
    yearlyPrice: 191.9, // 20% off annual (saves $48)
    features: [
      "Unlimited searches & favorites",
      "50 AI-powered searches per day",
      "Unlimited medication cabinet",
      "AI-powered journal insights",
      "Unlimited AI remedy reports",
      "Premium digest with AI health insights",
      "Compare up to 10 remedies",
      "Export & search history",
      "Priority support",
    ],
    limits: {
      favorites: PLAN_LIMITS.PREMIUM.maxFavorites,
      searchesPerDay: PLAN_LIMITS.PREMIUM.maxSearchesPerDay,
      aiSearches: PLAN_LIMITS.PREMIUM.maxAiSearchesPerDay,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

/**
 * Check if a feature is available for a plan
 */
export function isPlanFeatureAvailable(
  plan: PlanType,
  feature: "favorites" | "searchesPerDay" | "aiSearches",
  currentUsage: number,
): boolean {
  const limits = PLANS[plan].limits;
  const limit = limits[feature];
  return limit === -1 || currentUsage < limit;
}

/**
 * Get the limit for a feature
 */
export function getPlanLimit(
  plan: PlanType,
  feature: "favorites" | "searchesPerDay" | "aiSearches",
): number {
  return PLANS[plan].limits[feature];
}
