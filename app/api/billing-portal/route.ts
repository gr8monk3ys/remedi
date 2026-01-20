/**
 * Billing Portal API Endpoint
 *
 * Creates Stripe billing portal sessions for managing subscriptions.
 *
 * POST /api/billing-portal
 * Returns: { url: string } - Stripe billing portal URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createBillingPortalSession, isStripeConfigured } from '@/lib/stripe'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = await withRateLimit(request, RATE_LIMITS.billingPortal)
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
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to manage billing',
          },
        },
        { status: 401 }
      )
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { customerId: true },
    })

    if (!subscription?.customerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_CUSTOMER',
            message: 'No billing account found. Please subscribe first.',
          },
        },
        { status: 404 }
      )
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create billing portal session
    const portalSession = await createBillingPortalSession(
      subscription.customerId,
      `${baseUrl}/billing`
    )

    return NextResponse.json({
      success: true,
      data: { url: portalSession.url },
    })
  } catch (error) {
    console.error('[billing-portal] Error creating portal session:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PORTAL_ERROR',
          message: 'Failed to create billing portal session',
        },
      },
      { status: 500 }
    )
  }
}
