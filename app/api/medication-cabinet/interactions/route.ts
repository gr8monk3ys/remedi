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
import { getPlanLimits } from "@/lib/stripe-config";
import { getTrialStatus } from "@/lib/trial";

const logger = createLogger("cabinet-interactions-api");

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
    const plan = (await getTrialStatus(user.id)).plan;
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
