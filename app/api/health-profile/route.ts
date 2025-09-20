/**
 * Health Profile API Route
 *
 * GET /api/health-profile - Get user's health profile
 * PUT /api/health-profile - Create or update health profile
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getHealthProfile, upsertHealthProfile } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api/response";
import { healthProfileSchema } from "@/lib/validations/health-profile";
import { getValidationErrorMessage } from "@/lib/validations/api";
import { createLogger } from "@/lib/logger";

const logger = createLogger("health-profile-api");

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    const profile = await getHealthProfile(user.id);

    return NextResponse.json(
      successResponse({
        profile: profile ?? {
          categories: [],
          goals: [],
          allergies: [],
          conditions: [],
          dietaryPrefs: [],
        },
      }),
    );
  } catch (error) {
    logger.error("Error fetching health profile:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch health profile"),
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    const body = await request.json();
    const validation = healthProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    const profile = await upsertHealthProfile(user.id, validation.data);

    return NextResponse.json(
      successResponse({
        profile,
        message: "Health profile updated",
      }),
    );
  } catch (error) {
    logger.error("Error updating health profile:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to update health profile"),
      { status: 500 },
    );
  }
}
