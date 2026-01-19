/**
 * Search History API Route
 *
 * POST /api/search-history - Save a search query to history
 * GET /api/search-history - Retrieve search history for a session/user
 * DELETE /api/search-history - Clear search history
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  getPopularSearches,
} from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import {
  saveSearchHistorySchema,
  getSearchHistorySchema,
  getValidationErrorMessage,
} from '@/lib/validations/api';
import { verifyOwnership } from '@/lib/authorization';

/**
 * GET /api/search-history
 * Retrieve search history for a session or user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const limitParam = searchParams.get('limit');
    const showPopular = searchParams.get('popular') === 'true';

    // If requesting popular searches (public data, no auth needed)
    if (showPopular) {
      const limit = limitParam ? parseInt(limitParam, 10) : 5;
      const popularSearches = await getPopularSearches(limit);

      return NextResponse.json(
        successResponse({
          popular: popularSearches,
        })
      );
    }

    // Verify user can access requested data
    const { authorized, error } = await verifyOwnership(userId, sessionId);
    if (!authorized && error) {
      return error;
    }

    // Validate query parameters
    const validation = getSearchHistorySchema.safeParse({
      sessionId,
      userId,
      limit: limitParam ? parseInt(limitParam, 10) : 10,
    });

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('INVALID_INPUT', getValidationErrorMessage(validation.error)),
        { status: 400 }
      );
    }

    const { limit } = validation.data;

    // Get search history
    const history = await getSearchHistory(sessionId, userId, limit);

    return NextResponse.json(
      successResponse({
        history,
        count: history.length,
      })
    );
  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch search history'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/search-history
 * Save a search query to history
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = saveSearchHistorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('INVALID_INPUT', getValidationErrorMessage(validation.error)),
        { status: 400 }
      );
    }

    const { query, resultsCount, sessionId, userId } = validation.data;

    // Verify user can create history for this userId
    const { authorized, error } = await verifyOwnership(userId, sessionId);
    if (!authorized && error) {
      return error;
    }

    // Save to database
    await saveSearchHistory(query, resultsCount, sessionId, userId);

    return NextResponse.json(
      successResponse({
        message: 'Search history saved successfully',
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving search history:', error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        errorResponse('CONFLICT', 'Search history entry already exists'),
        { status: 409 }
      );
    }

    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Failed to save search history'),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/search-history
 * Clear search history for a session or user
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId') || undefined;
    const userId = searchParams.get('userId') || undefined;

    if (!sessionId && !userId) {
      return NextResponse.json(
        errorResponse('INVALID_INPUT', 'Either sessionId or userId must be provided'),
        { status: 400 }
      );
    }

    // Verify user can delete this data
    const { authorized, error } = await verifyOwnership(userId, sessionId);
    if (!authorized && error) {
      return error;
    }

    const deletedCount = await clearSearchHistory(sessionId, userId);

    return NextResponse.json(
      successResponse({
        message: 'Search history cleared successfully',
        deletedCount,
      })
    );
  } catch (error) {
    console.error('Error clearing search history:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Failed to clear search history'),
      { status: 500 }
    );
  }
}
