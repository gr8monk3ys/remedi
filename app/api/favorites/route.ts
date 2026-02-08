/**
 * Favorites API Route
 *
 * POST /api/favorites - Add a remedy to favorites
 * GET /api/favorites - Get all favorites for a session/user
 * PUT /api/favorites - Update favorite notes or collection
 * DELETE /api/favorites - Remove a favorite
 */

import { NextRequest, NextResponse } from "next/server";
import {
  addFavorite,
  getFavorites,
  updateFavorite,
  removeFavorite,
  isFavorite,
  getCollectionNames,
  getFavoriteById,
} from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api/response";
import {
  addFavoriteSchema,
  updateFavoriteSchema,
  getFavoritesSchema,
  deleteFavoriteSchema,
  getValidationErrorMessage,
} from "@/lib/validations/api";
import { verifyOwnership, verifyResourceOwnership } from "@/lib/authorization";
import { trackUserEventSafe } from "@/lib/analytics/user-events";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * GET /api/favorites
 * Get all favorites for a session or user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const collectionName = searchParams.get("collectionName") || undefined;
    const getCollections = searchParams.get("collections") === "true";
    const checkFavorite = searchParams.get("check");

    // Verify user can access requested data
    const { authorized, error } = await verifyOwnership(userId, sessionId);
    if (!authorized && error) {
      return error;
    }

    // Get collection names
    if (getCollections) {
      const collections = await getCollectionNames(sessionId, userId);
      return NextResponse.json(
        successResponse({
          collections,
        }),
      );
    }

    // Check if a specific remedy is favorited
    if (checkFavorite) {
      const favorited = await isFavorite(checkFavorite, sessionId, userId);
      return NextResponse.json(
        successResponse({
          isFavorite: favorited,
          remedyId: checkFavorite,
        }),
      );
    }

    // Validate query parameters
    const validation = getFavoritesSchema.safeParse({
      sessionId,
      userId,
      collectionName,
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

    // Get favorites
    const favorites = await getFavorites(sessionId, userId, collectionName);

    return NextResponse.json(
      successResponse({
        favorites,
        count: favorites.length,
      }),
    );
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch favorites"),
      { status: 500 },
    );
  }
}

/**
 * POST /api/favorites
 * Add a remedy to favorites
 */
export async function POST(request: NextRequest) {
  // Check rate limit
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.favorites,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate request body
    const validation = addFavoriteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    // Verify user can create favorite for this userId
    const { authorized, error } = await verifyOwnership(
      validation.data.userId,
      validation.data.sessionId,
    );
    if (!authorized && error) {
      return error;
    }

    const favorite = await addFavorite(validation.data);

    await trackUserEventSafe({
      request,
      userId: validation.data.userId,
      sessionId: validation.data.sessionId,
      eventType: "add_favorite",
      eventData: {
        remedyId: validation.data.remedyId,
        collectionName: validation.data.collectionName,
      },
    });

    return NextResponse.json(
      successResponse({
        favorite,
        message: "Remedy added to favorites",
      }),
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding favorite:", error);

    // Handle unique constraint violations (already favorited)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        errorResponse("CONFLICT", "This remedy is already in your favorites"),
        { status: 409 },
      );
    }

    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to add favorite"),
      { status: 500 },
    );
  }
}

/**
 * PUT /api/favorites
 * Update favorite notes or collection
 */
export async function PUT(request: NextRequest) {
  // Check rate limit
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.favorites,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate request body
    const validation = updateFavoriteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    const { id, ...updates } = validation.data;

    // Extract the caller's session ID from query params for ownership verification
    const requestSessionId =
      request.nextUrl.searchParams.get("sessionId") || undefined;

    // Fetch existing favorite to verify ownership
    const existingFavorite = await getFavoriteById(id);
    if (!existingFavorite) {
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", "Favorite not found"),
        { status: 404 },
      );
    }

    // Verify user owns this favorite
    const { authorized, error } = await verifyResourceOwnership(
      existingFavorite.userId,
      existingFavorite.sessionId,
      requestSessionId,
    );
    if (!authorized && error) {
      return error;
    }

    const favorite = await updateFavorite(id, updates);

    return NextResponse.json(
      successResponse({
        favorite,
        message: "Favorite updated successfully",
      }),
    );
  } catch (error) {
    console.error("Error updating favorite:", error);

    // Handle not found errors
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", "Favorite not found"),
        { status: 404 },
      );
    }

    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to update favorite"),
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/favorites
 * Remove a favorite
 */
export async function DELETE(request: NextRequest) {
  // Check rate limit
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.favorites,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        errorResponse("INVALID_INPUT", "Favorite ID is required"),
        { status: 400 },
      );
    }

    // Validate ID
    const validation = deleteFavoriteSchema.safeParse({ id });

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    // Extract the caller's session ID from query params for ownership verification
    const requestSessionId = searchParams.get("sessionId") || undefined;

    // Fetch existing favorite to verify ownership
    const existingFavorite = await getFavoriteById(id);
    if (!existingFavorite) {
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", "Favorite not found"),
        { status: 404 },
      );
    }

    // Verify user owns this favorite
    const { authorized, error } = await verifyResourceOwnership(
      existingFavorite.userId,
      existingFavorite.sessionId,
      requestSessionId,
    );
    if (!authorized && error) {
      return error;
    }

    await removeFavorite(id);

    await trackUserEventSafe({
      request,
      userId: existingFavorite.userId || undefined,
      sessionId: existingFavorite.sessionId || undefined,
      eventType: "remove_favorite",
      eventData: {
        remedyId: existingFavorite.remedyId,
      },
    });

    return NextResponse.json(
      successResponse({
        message: "Favorite removed successfully",
      }),
    );
  } catch (error) {
    console.error("Error deleting favorite:", error);

    // Handle not found errors
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", "Favorite not found"),
        { status: 404 },
      );
    }

    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to delete favorite"),
      { status: 500 },
    );
  }
}
