/**
 * AI-Enhanced Search API
 *
 * POST /api/ai-search - Get AI-powered remedy recommendations
 *
 * Uses OpenAI GPT-4 for intelligent natural language processing
 * and context-aware remedy suggestions.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  enhanceRemedyMatching,
  processNaturalLanguageQuery,
  checkDrugInteractions,
} from "@/lib/ai-matching";
import { getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  getStatusCode,
} from "@/lib/api/response";
import { getValidationErrorMessage } from "@/lib/validations/api";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { createLogger } from "@/lib/logger";
import {
  canPerformAction,
  tryConsumeUsage,
  refundUsage,
} from "@/lib/analytics/usage-tracker";

const log = createLogger("ai-search-api");

/**
 * Request schema for AI search
 */
const aiSearchSchema = z.object({
  query: z
    .string({ message: "Query must be a string" })
    .min(1, { message: "Query cannot be empty" })
    .max(500, { message: "Query is too long (maximum 500 characters)" }),
  userHistory: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  symptoms: z.array(z.string()).optional(),
  preferences: z
    .object({
      evidenceLevel: z.enum(["strong", "moderate", "limited"]).optional(),
      category: z.array(z.string()).optional(),
    })
    .optional(),
  checkInteractions: z.boolean().optional().default(false),
});

/**
 * POST /api/ai-search
 * Get AI-powered remedy recommendations
 */
export async function POST(request: NextRequest) {
  // Check rate limit (AI search has stricter limits due to cost)
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.aiSearch,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  // Hoisted so the outer catch can give the reservation back too.
  let releaseReservation: (() => Promise<void>) | null = null;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "You must be signed in to use AI search"),
        { status: 401 },
      );
    }

    const canPerform = await canPerformAction(user.id, "aiSearches");
    if (!canPerform.allowed) {
      if (canPerform.limit === 0) {
        return NextResponse.json(
          errorResponse(
            "FORBIDDEN",
            "AI search requires a Basic plan or higher",
          ),
          { status: 403 },
        );
      }

      return NextResponse.json(
        errorResponse("LIMIT_EXCEEDED", "AI search daily limit exceeded", {
          currentUsage: canPerform.currentUsage,
          limit: canPerform.limit,
          plan: canPerform.plan,
        }),
        { status: 429 },
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        errorResponse(
          "SERVICE_UNAVAILABLE",
          "AI search is not configured. Please set OPENAI_API_KEY environment variable.",
        ),
        { status: 503 },
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = aiSearchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    const {
      query,
      userHistory,
      currentMedications,
      symptoms,
      preferences,
      checkInteractions,
    } = validation.data;

    // Reserve the quota atomically, immediately before the first paid call.
    // The read-only check above still short-circuits a plan gate early; this
    // is what actually holds the slot. Everything that can reject the request
    // — missing API key, unparseable body, failed validation — has already
    // returned by here, so a 400 still costs nothing.
    const reservation = await tryConsumeUsage(user.id, "aiSearches", 1);
    if (!reservation.allowed) {
      return reservation.reason === "not_in_plan"
        ? NextResponse.json(
            errorResponse(
              "FORBIDDEN",
              "AI search requires a Basic plan or higher",
            ),
            { status: 403 },
          )
        : NextResponse.json(
            errorResponse("LIMIT_EXCEEDED", "AI search daily limit exceeded", {
              currentUsage: reservation.currentUsage,
              limit: reservation.limit,
              plan: reservation.plan,
            }),
            { status: 429 },
          );
    }

    // Give the reservation back if the work it paid for did not happen.
    let charged = true;
    const release = async (): Promise<void> => {
      if (!charged) return;
      charged = false;
      try {
        await refundUsage(user.id, "aiSearches", reservation.date, 1);
      } catch (error) {
        log.warn("Failed to refund AI search usage", { error });
      }
    };
    releaseReservation = release;

    // Process natural language query first
    const nlpResult = await processNaturalLanguageQuery(query);

    // Get AI-enhanced recommendations
    const outcome = await enhanceRemedyMatching({
      query,
      userHistory,
      currentMedications:
        currentMedications ||
        (nlpResult.pharmaceuticalMentioned
          ? [nlpResult.pharmaceuticalMentioned]
          : undefined),
      symptoms: symptoms || nlpResult.symptomsMentioned,
      preferences: {
        ...preferences,
        category: preferences?.category || nlpResult.preferredCategories,
      },
    });

    // We could not reach the model. That is a failure, not an answer, so it
    // ships as a 503 rather than a 200 with an empty list — the same way the
    // primary search path reports an unreachable tier.
    if (outcome.kind === "unknown" && outcome.reason === "unavailable") {
      // We never got an answer, so the reservation is given back.
      await release();
      log.warn("AI search could not complete", { message: outcome.message });
      return NextResponse.json(
        errorResponse("SERVICE_UNAVAILABLE", outcome.message),
        { status: getStatusCode("SERVICE_UNAVAILABLE") },
      );
    }

    // A refusal is reported as a refusal. Returning an empty recommendation
    // list would make "we do not suggest remedies alongside this drug" look
    // identical to "the model found nothing", which is the one confusion this
    // policy exists to prevent.
    if (outcome.kind === "unknown") {
      // A refusal is decided before the model is called, so it stays free —
      // which is what the previous increment-on-success shape did too.
      await release();
      return NextResponse.json(
        successResponse({
          intent: nlpResult.intent,
          recommendations: [],
          refused: { reason: outcome.reason, message: outcome.message },
          interactions: null,
          extractedInfo: {
            pharmaceutical: nlpResult.pharmaceuticalMentioned,
            symptoms: nlpResult.symptomsMentioned,
            categories: nlpResult.preferredCategories,
            concerns: nlpResult.concerns,
          },
        }),
      );
    }

    const recommendations = outcome.data;

    // Check for drug interactions if requested
    let interactionResults = null;
    if (
      checkInteractions &&
      currentMedications &&
      currentMedications.length > 0
    ) {
      interactionResults = await Promise.all(
        recommendations.map(async (rec) => {
          const outcome = await checkDrugInteractions(
            rec.remedy.name,
            currentMedications,
          );

          // `checked` is the discriminator a reader needs. Without it, an
          // outage and a genuine all-clear arrive as the same payload — and
          // the old sentinel answered an outage with a fabricated moderate
          // interaction rather than saying it could not check.
          if (outcome.kind === "unknown") {
            return {
              remedyName: rec.remedy.name,
              checked: false as const,
              message: outcome.message,
            };
          }

          return {
            remedyName: rec.remedy.name,
            checked: true as const,
            ...outcome.data,
          };
        }),
      );
    }

    return NextResponse.json(
      successResponse({
        intent: nlpResult.intent,
        recommendations,
        interactions: interactionResults,
        extractedInfo: {
          pharmaceutical: nlpResult.pharmaceuticalMentioned,
          symptoms: nlpResult.symptomsMentioned,
          categories: nlpResult.preferredCategories,
          concerns: nlpResult.concerns,
        },
      }),
    );
  } catch (error) {
    // The request threw after the quota was reserved, so give it back.
    await releaseReservation?.();
    log.error("AI search error", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Invalid or missing OpenAI API key"),
        { status: 401 },
      );
    }

    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to process AI search request"),
      { status: 500 },
    );
  }
}

/**
 * GET /api/ai-search
 * Health check endpoint
 */
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;

  // Check if key exists and looks valid (starts with sk- and is long enough)
  const isConfigured = !!(
    apiKey &&
    apiKey.startsWith("sk-") &&
    apiKey.length > 20 &&
    !apiKey.includes("dummy") &&
    !apiKey.includes("your-")
  );

  return NextResponse.json(
    successResponse({
      status: isConfigured ? "available" : "not_configured",
      message: isConfigured
        ? "AI search is available"
        : "AI search requires a valid OPENAI_API_KEY environment variable",
      features: {
        naturalLanguageProcessing: isConfigured,
        intelligentMatching: isConfigured,
        drugInteractionChecking: isConfigured,
        personalizedRecommendations: isConfigured,
      },
    }),
  );
}
