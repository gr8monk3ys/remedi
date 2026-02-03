/**
 * Stripe Configuration and Utilities
 *
 * Provides Stripe client initialization and helper functions
 * for subscription management.
 */

import Stripe from 'stripe'

// Lazy-initialized Stripe client (avoids build-time errors)
let stripeInstance: Stripe | null = null

/**
 * Get the Stripe client (lazy initialization)
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Backward compatibility - use getter
export const stripe = {
  get customers() {
    return getStripe().customers
  },
  get subscriptions() {
    return getStripe().subscriptions
  },
  get checkout() {
    return getStripe().checkout
  },
  get billingPortal() {
    return getStripe().billingPortal
  },
  get webhooks() {
    return getStripe().webhooks
  },
}

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
  },
} as const

export type PlanLimits = typeof PLAN_LIMITS[keyof typeof PLAN_LIMITS]

/**
 * Get plan limits by plan type
 */
export function getPlanLimits(plan: PlanType): PlanLimits {
  const planKey = plan.toUpperCase() as keyof typeof PLAN_LIMITS
  return PLAN_LIMITS[planKey] || PLAN_LIMITS.FREE
}

/**
 * Check if a usage value is within the plan limit
 * Returns true if the usage is allowed, false if limit is exceeded
 */
export function isWithinLimit(limit: number, currentUsage: number): boolean {
  return limit === -1 || currentUsage < limit
}

/**
 * Calculate usage percentage (0-100)
 * Returns 0 for unlimited plans
 */
export function getUsagePercentage(limit: number, currentUsage: number): number {
  if (limit === -1) return 0
  if (limit === 0) return 100
  return Math.min(100, Math.round((currentUsage / limit) * 100))
}

/**
 * Subscription plan configuration
 */
export const PLANS = {
  free: {
    name: 'Free',
    description: 'Get started with basic natural remedy search',
    price: 0,
    features: [
      'Basic search functionality',
      'View remedy details',
      'Save up to 3 favorites',
      '5 searches per day',
    ],
    limits: {
      favorites: PLAN_LIMITS.FREE.maxFavorites,
      searchesPerDay: PLAN_LIMITS.FREE.maxSearchesPerDay,
      aiSearches: PLAN_LIMITS.FREE.maxAiSearchesPerDay,
    },
  },
  basic: {
    name: 'Basic',
    description: 'Enhanced access with more features',
    monthlyPriceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
    price: 9.99,
    yearlyPrice: 95.90, // 20% off annual (saves $24)
    features: [
      '100 searches per day',
      'Save up to 50 favorites',
      '10 AI-powered searches per day',
      'Full search history',
      'Compare up to 4 remedies',
      'Export your data',
    ],
    limits: {
      favorites: PLAN_LIMITS.BASIC.maxFavorites,
      searchesPerDay: PLAN_LIMITS.BASIC.maxSearchesPerDay,
      aiSearches: PLAN_LIMITS.BASIC.maxAiSearchesPerDay,
    },
  },
  premium: {
    name: 'Premium',
    description: 'Full access with AI-powered features',
    monthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
    price: 19.99,
    yearlyPrice: 191.90, // 20% off annual (saves $48)
    features: [
      'Unlimited searches',
      'Unlimited favorites',
      '50 AI-powered searches per day',
      'Full search history',
      'Compare up to 10 remedies',
      'Export your data',
      'Priority support',
      'Early access to new features',
    ],
    limits: {
      favorites: PLAN_LIMITS.PREMIUM.maxFavorites,
      searchesPerDay: PLAN_LIMITS.PREMIUM.maxSearchesPerDay,
      aiSearches: PLAN_LIMITS.PREMIUM.maxAiSearchesPerDay,
    },
  },
} as const

export type PlanType = keyof typeof PLANS

/**
 * Get plan by Stripe price ID
 */
export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [plan, config] of Object.entries(PLANS)) {
    if (
      'monthlyPriceId' in config &&
      (config.monthlyPriceId === priceId || config.yearlyPriceId === priceId)
    ) {
      return plan as PlanType
    }
  }
  return null
}

/**
 * Check if a feature is available for a plan
 */
export function isPlanFeatureAvailable(
  plan: PlanType,
  feature: 'favorites' | 'searchesPerDay' | 'aiSearches',
  currentUsage: number
): boolean {
  const limits = PLANS[plan].limits
  const limit = limits[feature]
  return limit === -1 || currentUsage < limit
}

/**
 * Get the limit for a feature
 */
export function getPlanLimit(
  plan: PlanType,
  feature: 'favorites' | 'searchesPerDay' | 'aiSearches'
): number {
  return PLANS[plan].limits[feature]
}

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // First, check if we already have a customer ID stored
  const { prisma } = await import('@/lib/db')
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { customerId: true },
  })

  if (subscription?.customerId) {
    return subscription.customerId
  }

  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    const customerId = existingCustomers.data[0].id

    // Store the customer ID
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        customerId,
        plan: 'free',
        status: 'active',
      },
      update: { customerId },
    })

    return customerId
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  })

  // Store the customer ID
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      customerId: customer.id,
      plan: 'free',
      status: 'active',
    },
    update: { customerId: customer.id },
  })

  return customer.id
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
  customerId: string
  priceId: string
  userId: string
  successUrl: string
  cancelUrl: string
  trialPeriodDays?: number
}): Promise<Stripe.Checkout.Session> {
  const subscriptionData: Stripe.Checkout.SessionCreateParams['subscription_data'] = {
    metadata: { userId },
  }

  // Add trial period if specified
  if (trialPeriodDays && trialPeriodDays > 0) {
    subscriptionData.trial_period_days = trialPeriodDays
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
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
  })
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PUBLISHABLE_KEY
}
