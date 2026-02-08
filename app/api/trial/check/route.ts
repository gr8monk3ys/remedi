/**
 * Trial Eligibility Check API
 *
 * GET /api/trial/check
 * Returns the user's trial eligibility status.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTrialStatus, isTrialEligible, TRIAL_CONFIG } from "@/lib/trial";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to check trial eligibility",
          },
        },
        { status: 401 },
      );
    }

    const [eligible, trialStatus] = await Promise.all([
      isTrialEligible(user.id),
      getTrialStatus(user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        isEligible: eligible,
        isActive: trialStatus.isActive,
        hasUsedTrial: trialStatus.hasUsedTrial,
        startDate: trialStatus.startDate,
        endDate: trialStatus.endDate,
        daysRemaining: trialStatus.daysRemaining,
        currentPlan: trialStatus.plan,
        trialConfig: {
          durationDays: TRIAL_CONFIG.durationDays,
          plan: TRIAL_CONFIG.plan,
          features: TRIAL_CONFIG.features,
        },
      },
    });
  } catch (error) {
    console.error("[trial/check] Error checking trial eligibility:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to check trial eligibility",
        },
      },
      { status: 500 },
    );
  }
}
