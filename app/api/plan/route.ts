/**
 * Plan API
 *
 * GET /api/plan
 * Returns the effective plan + feature limits for the current visitor.
 *
 * - Anonymous visitors are treated as "free".
 * - Authenticated users get their effective plan (trial/subscription aware).
 *
 * This endpoint is intentionally lightweight compared to /api/usage.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  getStatusCode,
} from "@/lib/api/response";
import { PLAN_LIMITS } from "@/lib/stripe-config";
import { getEffectivePlanLimits } from "@/lib/trial";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        successResponse({
          plan: "free" as const,
          isTrial: false,
          limits: PLAN_LIMITS.FREE,
        }),
        { status: 200 },
      );
    }

    const { limits, plan, isTrial } = await getEffectivePlanLimits(user.id);

    return NextResponse.json(
      successResponse({
        plan,
        isTrial,
        limits,
      }),
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Failed to load plan",
      ),
      { status: getStatusCode("INTERNAL_ERROR") },
    );
  }
}
