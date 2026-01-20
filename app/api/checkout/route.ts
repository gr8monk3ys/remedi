/**
 * Checkout API Endpoint
 *
 * Creates Stripe checkout sessions for subscription purchases.
 *
 * POST /api/checkout
 * Body: { priceId: string }
 * Returns: { url: string } - Stripe checkout URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createCheckoutSession,
  getOrCreateStripeCustomer,
  isStripeConfigured,
  PLANS,
} from '@/lib/stripe'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

// Build allowlist of valid price IDs from PLANS config
const validPriceIds = new Set(
  Object.values(PLANS)
    .filter((plan): plan is typeof PLANS.basic => 'monthlyPriceId' in plan)
    .flatMap((plan) => [plan.monthlyPriceId, plan.yearlyPriceId])
    .filter((id): id is string => !!id)
)

const checkoutSchema = z.object({
  priceId: z
    .string()
    .min(1, 'Price ID is required')
    .refine((id) => validPriceIds.has(id), 'Invalid price ID'),
})

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = await withRateLimit(request, RATE_LIMITS.checkout)
    if (!rateLimit.allowed) {
      return rateLimit.response
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STRIPE_NOT_CONFIGURED',
            message: 'Payment system is not configured',
          },
        },
        { status: 503 }
      )
    }

    // Authenticate user
    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to subscribe',
          },
        },
        { status: 401 }
      )
    }

    // Validate request body
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      // Zod v4 uses 'issues' instead of 'errors'
      const firstIssue = parsed.error.issues?.[0]
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstIssue?.message || 'Validation failed',
          },
        },
        { status: 400 }
      )
    }

    const { priceId } = parsed.data

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email,
      session.user.name || undefined
    )

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      userId: session.user.id,
      successUrl: `${baseUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/billing?canceled=true`,
    })

    return NextResponse.json({
      success: true,
      data: { url: checkoutSession.url },
    })
  } catch (error) {
    console.error('[checkout] Error creating checkout session:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHECKOUT_ERROR',
          message: 'Failed to create checkout session',
        },
      },
      { status: 500 }
    )
  }
}
