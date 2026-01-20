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
 * Subscription plan configuration
 */
export const PLANS = {
  free: {
    name: 'Free',
    description: 'Basic access to natural remedy search',
    price: 0,
    features: [
      'Basic search functionality',
      'View remedy details',
      'Save up to 5 favorites',
      '10 searches per day',
    ],
    limits: {
      favorites: 5,
      searchesPerDay: 10,
      aiSearches: 0,
    },
  },
  basic: {
    name: 'Basic',
    description: 'Enhanced access with more features',
    monthlyPriceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
    price: 9.99,
    yearlyPrice: 99.99,
    features: [
      'Unlimited searches',
      'Save unlimited favorites',
      'Search history',
      'Filter preferences',
      'Priority support',
    ],
    limits: {
      favorites: -1, // unlimited
      searchesPerDay: -1, // unlimited
      aiSearches: 10,
    },
  },
  premium: {
    name: 'Premium',
    description: 'Full access with AI-powered features',
    monthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
    price: 19.99,
    yearlyPrice: 199.99,
    features: [
      'Everything in Basic',
      'AI-powered remedy matching',
      'Drug interaction checking',
      'Personalized recommendations',
      'Export data',
      'API access',
    ],
    limits: {
      favorites: -1,
      searchesPerDay: -1,
      aiSearches: -1, // unlimited
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
}: {
  customerId: string
  priceId: string
  userId: string
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
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
    subscription_data: {
      metadata: { userId },
    },
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
