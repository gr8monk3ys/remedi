/**
 * Authorization Utilities
 *
 * Helper functions for verifying user permissions and data ownership.
 *
 * Security Model for Anonymous Sessions:
 * - Session IDs are client-generated UUIDs that act as bearer tokens
 * - The UUID v4 format provides 122 bits of randomness (2^122 possible values)
 * - Enumeration attacks are mitigated by:
 *   1. UUID validation (rejects non-UUID values)
 *   2. Rate limiting on API endpoints (see rate-limit.ts)
 *   3. The astronomically low probability of guessing a valid UUID
 * - Session data is ephemeral and non-sensitive (favorites, search history)
 */

import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/response";

/**
 * UUID v4 regex pattern for validation
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where y is 8, 9, a, or b
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate that a string is a properly formatted UUID v4
 */
export function isValidSessionId(sessionId: string): boolean {
  return UUID_V4_REGEX.test(sessionId);
}

/**
 * Verify that the requested userId matches the current authenticated user
 * or that the session belongs to the current user
 */
export async function verifyOwnership(
  requestedUserId?: string,
  requestedSessionId?: string,
): Promise<{
  authorized: boolean;
  currentUserId: string | null;
  error?: NextResponse;
}> {
  const currentUser = await getCurrentUser();
  const currentUserId = currentUser?.id || null;

  // If a userId is provided in the request, verify it matches the authenticated user
  if (requestedUserId) {
    // User must be authenticated to use userId
    if (!currentUserId) {
      return {
        authorized: false,
        currentUserId: null,
        error: NextResponse.json(
          errorResponse(
            "UNAUTHORIZED",
            "Authentication required to access user data",
          ),
          { status: 401 },
        ),
      };
    }

    // Verify the requested userId matches the authenticated user
    if (requestedUserId !== currentUserId) {
      return {
        authorized: false,
        currentUserId,
        error: NextResponse.json(
          errorResponse("FORBIDDEN", "You can only access your own data"),
          { status: 403 },
        ),
      };
    }
  }

  // If only sessionId is provided (anonymous user), validate and allow access
  // The session ID acts as a bearer token for anonymous data
  if (requestedSessionId && !requestedUserId) {
    // Validate session ID format to prevent enumeration attempts with invalid IDs
    if (!isValidSessionId(requestedSessionId)) {
      return {
        authorized: false,
        currentUserId,
        error: NextResponse.json(
          errorResponse("INVALID_INPUT", "Invalid session ID format"),
          { status: 400 },
        ),
      };
    }
    return {
      authorized: true,
      currentUserId,
    };
  }

  // If neither is provided, that's a validation error (handled by route)
  return {
    authorized: true,
    currentUserId,
  };
}

/**
 * Verify user can modify a specific resource by ID.
 * Used for PUT/DELETE operations where we need to check the resource owner.
 *
 * For user-owned resources, verifies the authenticated user matches.
 * For session-owned resources, verifies the caller's session ID matches
 * the resource's session ID (the session ID acts as a bearer token).
 *
 * @param resourceUserId - The userId stored on the resource (from DB)
 * @param resourceSessionId - The sessionId stored on the resource (from DB)
 * @param requestSessionId - The session ID provided by the current request caller
 */
export async function verifyResourceOwnership(
  resourceUserId: string | null | undefined,
  resourceSessionId: string | null | undefined,
  requestSessionId?: string | null,
): Promise<{ authorized: boolean; error?: NextResponse }> {
  const currentUser = await getCurrentUser();
  const currentUserId = currentUser?.id || null;

  // If resource has a userId, user must be authenticated and match
  if (resourceUserId) {
    if (!currentUserId) {
      return {
        authorized: false,
        error: NextResponse.json(
          errorResponse("UNAUTHORIZED", "Authentication required"),
          { status: 401 },
        ),
      };
    }

    if (resourceUserId !== currentUserId) {
      return {
        authorized: false,
        error: NextResponse.json(
          errorResponse("FORBIDDEN", "You can only modify your own data"),
          { status: 403 },
        ),
      };
    }

    return { authorized: true };
  }

  // If resource has a sessionId but no userId, verify the caller's session matches
  if (resourceSessionId) {
    // Caller must provide their session ID for comparison
    if (!requestSessionId) {
      return {
        authorized: false,
        error: NextResponse.json(
          errorResponse(
            "UNAUTHORIZED",
            "Session ID is required to modify this resource",
          ),
          { status: 401 },
        ),
      };
    }

    // Validate the request session ID format
    if (!isValidSessionId(requestSessionId)) {
      return {
        authorized: false,
        error: NextResponse.json(
          errorResponse("INVALID_INPUT", "Invalid session ID format"),
          { status: 400 },
        ),
      };
    }

    // Compare the resource's session ID against the caller's session ID
    if (resourceSessionId !== requestSessionId) {
      return {
        authorized: false,
        error: NextResponse.json(
          errorResponse("FORBIDDEN", "You can only modify your own data"),
          { status: 403 },
        ),
      };
    }

    return { authorized: true };
  }

  // Resource has neither userId nor sessionId -- allow (edge case)
  return { authorized: true };
}

/**
 * Get the effective user/session identifiers for a request
 * Prefers userId if authenticated, falls back to sessionId
 */
export async function getEffectiveIdentifiers(): Promise<{
  userId: string | undefined;
  sessionId: string | undefined;
}> {
  const currentUser = await getCurrentUser();

  return {
    userId: currentUser?.id || undefined,
    sessionId: undefined, // Session ID should come from client
  };
}
