/**
 * Start Trial API
 *
 * POST /api/trial/start
 * Starts a 7-day premium trial for the authenticated user.
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { startTrial, isTrialEligible, TRIAL_CONFIG } from '@/lib/trial'
import {
  trackTrialStarted,
  EVENT_SOURCES,
} from '@/lib/analytics/conversion-events'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to start a trial',
          },
        },
        { status: 401 }
      )
    }

    // Check eligibility
    const eligible = await isTrialEligible(session.user.id)
    if (!eligible) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRIAL_NOT_ELIGIBLE',
            message: 'You have already used your free trial',
          },
        },
        { status: 400 }
      )
    }

    // Start the trial
    const result = await startTrial(session.user.id)

    // Track the conversion event
    await trackTrialStarted({
      userId: session.user.id,
      source: EVENT_SOURCES.API,
      metadata: {
        daysInTrial: TRIAL_CONFIG.durationDays,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Trial started successfully',
        trialEndDate: result.trialEndDate,
        daysRemaining: result.daysRemaining,
        plan: TRIAL_CONFIG.plan,
        features: TRIAL_CONFIG.features,
      },
    })
  } catch (error) {
    console.error('[trial/start] Error starting trial:', error)

    // Handle specific error cases
    if (error instanceof Error && error.message.includes('not eligible')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRIAL_NOT_ELIGIBLE',
            message: error.message,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to start trial',
        },
      },
      { status: 500 }
    )
  }
}
