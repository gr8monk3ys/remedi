/**
 * Journal Insights API Route
 *
 * GET /api/journal/insights?remedyId=<id> - Get effectiveness insights for a remedy
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRemedyInsights } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createLogger } from "@/lib/logger";
import { getPlanLimits } from "@/lib/stripe-config";
import type { PlanType } from "@/lib/stripe-config";

const logger = createLogger("journal-insights-api");

async function getUserPlan(userId: string): Promise<PlanType> {
  const { prisma } = await import("@/lib/db");
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });
  if (sub && sub.status === "active") {
    return sub.plan as PlanType;
  }
  return "free";
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    // Check plan
    const plan = await getUserPlan(user.id);
    const limits = getPlanLimits(plan);
    if (!limits.canTrackJournal) {
      return NextResponse.json(
        errorResponse(
          "FORBIDDEN",
          "Journal insights require a Basic plan or higher",
        ),
        { status: 403 },
      );
    }

    const remedyId = request.nextUrl.searchParams.get("remedyId");
    if (!remedyId) {
      return NextResponse.json(
        errorResponse("INVALID_INPUT", "Remedy ID is required"),
        { status: 400 },
      );
    }

    const insights = await getRemedyInsights(user.id, remedyId);

    if (!insights) {
      return NextResponse.json(
        errorResponse(
          "RESOURCE_NOT_FOUND",
          "No journal entries found for this remedy",
        ),
        { status: 404 },
      );
    }

    return NextResponse.json(successResponse({ insights }));
  } catch (error) {
    logger.error("Error fetching journal insights:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch journal insights"),
      { status: 500 },
    );
  }
}
