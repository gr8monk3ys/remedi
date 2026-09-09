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

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  getStatusCode,
} from "@/lib/api/response";
import { PLAN_LIMITS } from "@/lib/stripe-config";
import { getEffectivePlanLimits } from "@/lib/trial";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Anonymous callers can reach this, and `search` — the comparable public
  // endpoint — is already limited. Rate limiting is opt-in per route here, so
  // an unlimited public read is an omission rather than a decision.
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.general,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

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
