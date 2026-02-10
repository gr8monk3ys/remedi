/**
 * Filter Preferences API Route
 *
 * GET /api/filter-preferences - Get filter preferences for a session/user
 * POST /api/filter-preferences - Save or update filter preferences
 * DELETE /api/filter-preferences - Clear filter preferences
 */

import { NextRequest, NextResponse } from "next/server";
import {
  saveFilterPreferences,
  getFilterPreferences,
  clearFilterPreferences,
} from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api/response";
import {
  saveFilterPreferencesSchema,
  getFilterPreferencesSchema,
  getValidationErrorMessage,
} from "@/lib/validations/api";
import { verifyOwnership } from "@/lib/authorization";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-filter-preferences");

/**
 * GET /api/filter-preferences
 * Get filter preferences for a session or user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId") || undefined;
    const userId = searchParams.get("userId") || undefined;

    // Validate query parameters
    const validation = getFilterPreferencesSchema.safeParse({
      sessionId,
      userId,
    });

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    if (!sessionId && !userId) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          "Either sessionId or userId must be provided",
        ),
        { status: 400 },
      );
    }

    // Verify user can access requested data
    const { authorized, error } = await verifyOwnership(userId, sessionId);
    if (!authorized && error) {
      return error;
    }

    const preferences = await getFilterPreferences(sessionId, userId);

    if (!preferences) {
      // Return default preferences if none exist
      return NextResponse.json(
        successResponse({
          preferences: {
            categories: [],
            nutrients: [],
            evidenceLevels: [],
            sortBy: null,
            sortOrder: null,
          },
          isDefault: true,
        }),
      );
    }

    return NextResponse.json(
      successResponse({
        preferences,
        isDefault: false,
      }),
    );
  } catch (error) {
    logger.error("Error fetching filter preferences", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch filter preferences"),
      { status: 500 },
    );
  }
}

/**
 * POST /api/filter-preferences
 * Save or update filter preferences
 */
export async function POST(request: NextRequest) {
  // Check rate limit
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.filterPreferences,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate request body
    const validation = saveFilterPreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    const { sessionId, userId } = validation.data;

    if (!sessionId && !userId) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          "Either sessionId or userId must be provided",
        ),
        { status: 400 },
      );
    }

    // Verify user can save preferences for this userId
    const { authorized, error } = await verifyOwnership(userId, sessionId);
    if (!authorized && error) {
      return error;
    }

    const preferences = await saveFilterPreferences(validation.data);

    return NextResponse.json(
      successResponse({
        preferences,
        message: "Filter preferences saved successfully",
      }),
      { status: 201 },
    );
  } catch (error) {
    logger.error("Error saving filter preferences", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to save filter preferences"),
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/filter-preferences
 * Clear filter preferences for a session or user
 */
export async function DELETE(request: NextRequest) {
  // Check rate limit
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.filterPreferences,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId") || undefined;
    const userId = searchParams.get("userId") || undefined;

    if (!sessionId && !userId) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          "Either sessionId or userId must be provided",
        ),
        { status: 400 },
      );
    }

    // Verify user can delete this data
    const { authorized, error } = await verifyOwnership(userId, sessionId);
    if (!authorized && error) {
      return error;
    }

    await clearFilterPreferences(sessionId, userId);

    return NextResponse.json(
      successResponse({
        message: "Filter preferences cleared successfully",
      }),
    );
  } catch (error) {
    logger.error("Error clearing filter preferences", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to clear filter preferences"),
      { status: 500 },
    );
  }
}
