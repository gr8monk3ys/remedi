import { NextRequest, NextResponse } from "next/server";
import { findInteractionsBySubstance, checkPairInteraction } from "@/lib/db";
import {
  interactionsBySubstanceSchema,
  interactionsCheckPairSchema,
} from "@/lib/validations/api";
import {
  successResponse,
  errorResponse,
  errorResponseFromError,
  getStatusCode,
} from "@/lib/api/response";

/**
 * GET /api/interactions
 *
 * Find drug interactions by substance name or check a specific pair.
 *
 * Query parameters:
 * - substance: Find all interactions for a given substance
 * - check: Check if two specific substances interact (comma-separated)
 *
 * Examples:
 * - GET /api/interactions?substance=St. John's Wort
 * - GET /api/interactions?check=Warfarin,Ginkgo Biloba
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const substanceParam = searchParams.get("substance");
    const checkParam = searchParams.get("check");

    // Must provide either substance or check parameter
    if (!substanceParam && !checkParam) {
      return NextResponse.json(
        errorResponse(
          "MISSING_PARAMETER",
          'Either "substance" or "check" query parameter is required',
        ),
        { status: getStatusCode("MISSING_PARAMETER") },
      );
    }

    // Mode 1: Find all interactions for a substance
    if (substanceParam) {
      const validation = interactionsBySubstanceSchema.safeParse({
        substance: substanceParam,
      });

      if (!validation.success) {
        const errorMessage =
          validation.error.issues[0]?.message || "Invalid substance parameter";
        return NextResponse.json(
          errorResponse("INVALID_INPUT", errorMessage, {
            issues: validation.error.issues,
          }),
          { status: getStatusCode("INVALID_INPUT") },
        );
      }

      const interactions = await findInteractionsBySubstance(
        validation.data.substance,
      );

      return NextResponse.json(
        successResponse(interactions, {
          total: interactions.length,
        }),
        {
          status: 200,
          headers: {
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        },
      );
    }

    // Mode 2: Check a specific pair
    if (checkParam) {
      const validation = interactionsCheckPairSchema.safeParse({
        check: checkParam,
      });

      if (!validation.success) {
        const errorMessage =
          validation.error.issues[0]?.message || "Invalid check parameter";
        return NextResponse.json(
          errorResponse("INVALID_INPUT", errorMessage, {
            issues: validation.error.issues,
          }),
          { status: getStatusCode("INVALID_INPUT") },
        );
      }

      const [substance1, substance2] = validation.data.check
        .split(",")
        .map((s) => s.trim());

      if (!substance1 || !substance2) {
        return NextResponse.json(
          errorResponse(
            "INVALID_INPUT",
            "Both substance names must be non-empty",
          ),
          { status: getStatusCode("INVALID_INPUT") },
        );
      }

      const interaction = await checkPairInteraction(substance1, substance2);

      return NextResponse.json(
        successResponse(interaction ? [interaction] : [], {
          total: interaction ? 1 : 0,
        }),
        {
          status: 200,
          headers: {
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        },
      );
    }

    // Should not reach here, but provide a fallback
    return NextResponse.json(
      errorResponse("INVALID_INPUT", "Invalid request parameters"),
      { status: getStatusCode("INVALID_INPUT") },
    );
  } catch (error) {
    return NextResponse.json(errorResponseFromError(error, "DATABASE_ERROR"), {
      status: getStatusCode("DATABASE_ERROR"),
    });
  }
}
