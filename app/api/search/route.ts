import { NextRequest, NextResponse } from "next/server";
import { fuzzySearch } from "@/lib/fuzzy-search";
import { searchFdaDrugs } from "@/lib/openFDA";
import { findNaturalRemediesForDrug } from "@/lib/remedyMapping";
import {
  searchPharmaceuticals,
  getNaturalRemediesForPharmaceutical,
  upsertPharmaceutical,
  saveSearchHistory,
} from "@/lib/db";
import { searchQuerySchema } from "@/lib/validations/api";
import {
  successResponse,
  errorResponse,
  errorResponseFromError,
  getStatusCode,
} from "@/lib/api/response";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { MOCK_PHARMACEUTICALS, MOCK_REMEDY_MAPPINGS } from "@/lib/mock-data";
import { COMMON_SUFFIXES, SPELLING_VARIANTS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";
import { trackUserEventSafe } from "@/lib/analytics/user-events";
import type { ProcessedDrug, NaturalRemedy } from "@/lib/types";

const log = createLogger("search-api");

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  // Check rate limit
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    req,
    RATE_LIMITS.search,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const queryParam = searchParams.get("query");
    const sessionId = searchParams.get("sessionId") || undefined;
    const userId = searchParams.get("userId") || undefined;

    log.info("Search query received", { query: queryParam });

    // Validate input
    const validation = searchQuerySchema.safeParse({ query: queryParam });
    if (!validation.success) {
      const errorMessage =
        validation.error.issues[0]?.message || "Invalid query parameter";
      log.debug("Validation failed", { error: errorMessage });
      return NextResponse.json(
        errorResponse("INVALID_INPUT", errorMessage, {
          issues: validation.error.issues,
        }),
        { status: getStatusCode("INVALID_INPUT") },
      );
    }

    const query = validation.data.query;

    // Helper function to save search history
    const saveHistory = async (resultsCount: number) => {
      try {
        await saveSearchHistory(query, resultsCount, sessionId, userId);
      } catch (error) {
        // Log error but don't fail the request
        log.error("Failed to save search history", error);
      }
    };

    const trackSearchEvent = async (resultsCount: number, source: string) => {
      await trackUserEventSafe({
        request: req,
        userId,
        sessionId,
        eventType: "search",
        eventData: {
          query,
          resultsCount,
          source,
          processingTimeMs: Date.now() - startTime,
        },
      });
    };

    // Process query - remove common suffixes and extra words
    let processedQuery = query.toLowerCase();
    // Remove common suffixes that might cause search issues
    COMMON_SUFFIXES.forEach((suffix) => {
      processedQuery = processedQuery.replace(
        new RegExp(`\\s${suffix}s?\\b`, "gi"),
        "",
      );
    });

    // Find if any variant matches and replace with standard spelling
    Object.entries(SPELLING_VARIANTS).forEach(([standard, variants]) => {
      variants.forEach((variant) => {
        if (processedQuery.includes(variant)) {
          processedQuery = processedQuery.replace(
            new RegExp(variant, "gi"),
            standard,
          );
        }
      });
    });

    processedQuery = processedQuery.trim();
    log.debug("Query processed", {
      original: query,
      processed: processedQuery,
    });

    // Strategy: Database first -> FDA API -> Mock data
    let pharmaceutical: ProcessedDrug | undefined;
    let remedies: NaturalRemedy[] = [];

    // Step 1: Try to find pharmaceutical in database
    log.debug("Searching database for pharmaceutical");
    const dbPharmaceuticals = await searchPharmaceuticals(processedQuery);

    if (dbPharmaceuticals.length > 0) {
      // Found in database - get remedies from database
      const dbPharma = dbPharmaceuticals[0];
      if (!dbPharma) {
        throw new Error("Unexpected: pharmaceutical at index 0 is undefined");
      }

      pharmaceutical = {
        id: dbPharma.id,
        fdaId: dbPharma.fdaId || "",
        name: dbPharma.name,
        description: dbPharma.description || "",
        category: dbPharma.category,
        ingredients: dbPharma.ingredients,
        benefits: dbPharma.benefits,
        usage: dbPharma.usage || undefined,
        warnings: dbPharma.warnings || undefined,
        interactions: dbPharma.interactions || undefined,
      };

      log.info("Found pharmaceutical in database", {
        name: pharmaceutical.name,
      });
      remedies = await getNaturalRemediesForPharmaceutical(pharmaceutical.id);

      if (remedies.length > 0) {
        log.info("Found remedies from database", { count: remedies.length });
        await saveHistory(remedies.length);
        await trackSearchEvent(remedies.length, "database");
        const processingTime = Date.now() - startTime;
        return NextResponse.json(
          successResponse(remedies, {
            total: remedies.length,
            processingTime,
            apiVersion: "1.0",
          }),
          { status: 200 },
        );
      }
    }

    // Step 2: If not in database, try OpenFDA API
    log.debug("Searching OpenFDA API");
    const drugResults: ProcessedDrug[] = await searchFdaDrugs(processedQuery);

    if (drugResults.length > 0) {
      pharmaceutical = drugResults[0];
      log.info("Found pharmaceutical from FDA API", {
        name: pharmaceutical.name,
      });

      // Save to database for future use
      try {
        await upsertPharmaceutical(pharmaceutical);
        log.debug("Saved pharmaceutical to database");
      } catch (error) {
        log.error("Failed to save pharmaceutical to database", error);
      }

      // Find natural remedies using the mapping algorithm
      remedies = await findNaturalRemediesForDrug(pharmaceutical);

      if (remedies.length > 0) {
        log.info("Found remedies using mapping algorithm", {
          count: remedies.length,
        });
        await saveHistory(remedies.length);
        await trackSearchEvent(remedies.length, "openfda");
        const processingTime = Date.now() - startTime;
        return NextResponse.json(
          successResponse(remedies, {
            total: remedies.length,
            processingTime,
            apiVersion: "1.0",
          }),
          { status: 200 },
        );
      }
    }

    // Step 3: Fall back to mock data
    log.debug("Falling back to mock data");
    const searchablePharmaceuticals = MOCK_PHARMACEUTICALS.map((p) => ({
      ...p,
      searchText: `${p.name} ${p.category} ${p.ingredients.join(" ")} ${p.benefits.join(" ")}`,
    }));

    const matchedPharmaceuticals = fuzzySearch(
      processedQuery,
      searchablePharmaceuticals,
      (item) => item.searchText,
    );

    if (matchedPharmaceuticals.length === 0) {
      log.info("No pharmaceutical found", { query });
      await saveHistory(0);
      await trackSearchEvent(0, "mock");
      const processingTime = Date.now() - startTime;
      return NextResponse.json(
        successResponse([], {
          total: 0,
          processingTime,
          apiVersion: "1.0",
        }),
        { status: 200 },
      );
    }

    pharmaceutical = matchedPharmaceuticals[0];
    log.info("Best match from mock data", { name: pharmaceutical.name });

    // Find natural remedies for the pharmaceutical from mock data
    const mockRemedies = MOCK_REMEDY_MAPPINGS[pharmaceutical.id] || [];

    // Add similarity score to remedies based on matching nutrients
    const scoredRemedies = mockRemedies.map((remedy) => {
      const matchScore =
        remedy.matchingNutrients.length /
        Math.max(pharmaceutical!.ingredients.length, 1);

      return {
        ...remedy,
        similarityScore: Number(
          (matchScore * (pharmaceutical?.similarityScore || 1.0)).toFixed(2),
        ),
      };
    });

    // Sort by similarity score (highest first)
    const sortedRemedies = scoredRemedies.sort(
      (a, b) => b.similarityScore - a.similarityScore,
    );

    log.info("Found remedies from mock data", { count: sortedRemedies.length });
    await saveHistory(sortedRemedies.length);
    await trackSearchEvent(sortedRemedies.length, "mock");
    const processingTime = Date.now() - startTime;
    return NextResponse.json(
      successResponse(sortedRemedies, {
        total: sortedRemedies.length,
        processingTime,
        apiVersion: "1.0",
      }),
      { status: 200 },
    );
  } catch (error) {
    log.error("Error in search API", error);
    return NextResponse.json(errorResponseFromError(error, "INTERNAL_ERROR"), {
      status: getStatusCode("INTERNAL_ERROR"),
    });
  }
}
