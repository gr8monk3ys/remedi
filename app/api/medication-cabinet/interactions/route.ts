/**
 * Medication Cabinet Interactions API Route
 *
 * GET /api/medication-cabinet/interactions - Check interactions between cabinet meds
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkCabinetInteractions } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createLogger } from "@/lib/logger";
import { getPlanLimits, parsePlanType } from "@/lib/stripe-config";
import type { PlanType } from "@/lib/stripe-config";

const logger = createLogger("cabinet-interactions-api");

async function getUserPlan(userId: string): Promise<PlanType> {
  const { prisma } = await import("@/lib/db");
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });
  if (sub && sub.status === "active") {
    return parsePlanType(sub.plan);
  }
  return "free";
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    // Check plan - interaction checking requires Basic+
    const plan = await getUserPlan(user.id);
    const limits = getPlanLimits(plan);

    if (!limits.canViewCabinetInteractions) {
      return NextResponse.json(
        errorResponse(
          "FORBIDDEN",
          "Cabinet interaction checking requires a Basic plan or higher",
        ),
        { status: 403 },
      );
    }

    const interactions = await checkCabinetInteractions(user.id);

    return NextResponse.json(
      successResponse({
        interactions,
        count: interactions.length,
      }),
    );
  } catch (error) {
    logger.error("Error checking cabinet interactions:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to check cabinet interactions"),
      { status: 500 },
    );
  }
}
