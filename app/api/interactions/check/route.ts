import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { checkMultipleInteractions } from "@/lib/db";
import { interactionsCheckMultipleSchema } from "@/lib/validations/api";
import {
  successResponse,
  errorResponse,
  errorResponseFromError,
  getStatusCode,
} from "@/lib/api/response";

/**
 * POST /api/interactions/check
 *
 * Check all pairwise interactions for a list of substances.
 * Used by the "medication cabinet" feature where users list what they take.
 *
 * Request body:
 * {
 *   "substances": ["Warfarin", "St. John's Wort", "Ginkgo Biloba", "Aspirin"]
 * }
 *
 * Returns all found interactions between any pair of substances,
 * sorted by severity (most severe first).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Check rate limit
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    req,
    RATE_LIMITS.interactionsCheck,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          'Request body must be valid JSON with a "substances" array',
        ),
        { status: getStatusCode("INVALID_INPUT") },
      );
    }

    // Validate input
    const validation = interactionsCheckMultipleSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage =
        validation.error.issues[0]?.message || "Invalid request body";
      return NextResponse.json(
        errorResponse("INVALID_INPUT", errorMessage, {
          issues: validation.error.issues,
        }),
        { status: getStatusCode("INVALID_INPUT") },
      );
    }

    const { substances } = validation.data;

    const interactions = await checkMultipleInteractions(substances);

    return NextResponse.json(
      successResponse(
        {
          interactions,
          substancesChecked: substances,
          pairsChecked: (substances.length * (substances.length - 1)) / 2,
          interactionsFound: interactions.length,
        },
        {
          total: interactions.length,
        },
      ),
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(errorResponseFromError(error, "DATABASE_ERROR"), {
      status: getStatusCode("DATABASE_ERROR"),
    });
  }
}
