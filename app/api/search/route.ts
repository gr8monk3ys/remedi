import { NextRequest, NextResponse } from "next/server";
import { fuzzySearch } from "@/lib/fuzzy-search";
import { searchFdaDrugs } from "@/lib/openFDA";
import {
  searchPharmaceuticals,
  getNaturalRemediesForPharmaceutical,
  generateRemedyMappingsForPharmaceutical,
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
import { createLogger } from "@/lib/logger";
import { trackUserEventSafe } from "@/lib/analytics/user-events";
import { getCurrentUser } from "@/lib/auth";
import { isDemoDataEnabled } from "@/lib/env";
import { normalizeSearchQuery } from "@/lib/search/query-normalization";
import { resolveSearch, type SearchPorts } from "@/lib/search/resolve";
import type { ProcessedDrug, NaturalRemedy } from "@/lib/types";

const log = createLogger("search-api");

const CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=3600";

/** Convert a stored pharmaceutical row into the shape search works with. */
function toProcessedDrug(row: {
  id: string;
  fdaId: string | null;
  name: string;
  description: string | null;
  category: string;
  ingredients: string[];
  benefits: string[];
  usage: string | null;
  warnings: string | null;
  interactions: string | null;
}): ProcessedDrug {
  return {
    id: row.id,
    fdaId: row.fdaId || "",
    name: row.name,
    description: row.description || "",
    category: row.category,
    ingredients: row.ingredients,
    benefits: row.benefits,
    usage: row.usage || undefined,
    warnings: row.warnings || undefined,
    interactions: row.interactions || undefined,
  };
}

/** Demo remedies, or null when demo data is disabled. */
function findDemoRemedies(query: string): NaturalRemedy[] | null {
  if (!isDemoDataEnabled()) return null;

  const searchable = MOCK_PHARMACEUTICALS.map((p) => ({
    ...p,
    searchText: `${p.name} ${p.category} ${p.ingredients.join(" ")} ${p.benefits.join(" ")}`,
  }));

  const matched = fuzzySearch(query, searchable, (item) => item.searchText);
  const drug = matched[0];
  if (!drug) return [];

  const remedies = MOCK_REMEDY_MAPPINGS[drug.id] || [];

  return remedies
    .map((remedy) => {
      const matchScore =
        remedy.matchingNutrients.length /
        Math.max(drug.ingredients?.length ?? 0, 1);
      return {
        ...remedy,
        similarityScore: Number(
          (matchScore * (drug.similarityScore || 1.0)).toFixed(2),
        ),
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore);
}

const productionPorts: SearchPorts = {
  async findPharmaceuticals(query) {
    const rows = await searchPharmaceuticals(query);
    return rows.map(toProcessedDrug);
  },
  findRemediesFor: getNaturalRemediesForPharmaceutical,
  generateMappingsFor: generateRemedyMappingsForPharmaceutical,
  searchFda: searchFdaDrugs,
  cachePharmaceutical: upsertPharmaceutical,
  findDemoRemedies,
};

export async function GET(req: NextRequest) {
  const startTime = Date.now();

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
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;

    const validation = searchQuerySchema.safeParse({ query: queryParam });
    if (!validation.success) {
      const errorMessage =
        validation.error.issues[0]?.message || "Invalid search query";
      return NextResponse.json(
        errorResponse("INVALID_INPUT", errorMessage, {
          issues: validation.error.issues,
        }),
        { status: getStatusCode("INVALID_INPUT") },
      );
    }

    const query = validation.data.query;
    const processedQuery = normalizeSearchQuery(query);

    const record = (resultsCount: number, source: string) => {
      void Promise.allSettled([
        (async () => {
          try {
            await saveSearchHistory(query, resultsCount, sessionId, userId);
          } catch (error) {
            log.error("Failed to save search history", error);
          }
        })(),
        trackUserEventSafe({
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
        }),
      ]);
    };

    const outcome = await resolveSearch(processedQuery, productionPorts);

    // A tier we depend on could not be reached. Saying "no remedies found"
    // here would present an outage as a medical answer.
    if (outcome.kind === "unavailable") {
      log.warn("Search could not complete", { which: outcome.which });
      record(0, `unavailable:${outcome.which}`);
      return NextResponse.json(
        errorResponse(
          "SERVICE_UNAVAILABLE",
          "We could not complete your search just now. This is not a result — please try again shortly.",
        ),
        { status: getStatusCode("SERVICE_UNAVAILABLE") },
      );
    }

    const remedies = outcome.kind === "found" ? outcome.remedies : [];
    const source = outcome.kind === "found" ? outcome.source : "none";

    record(remedies.length, source);

    return NextResponse.json(
      successResponse(remedies, {
        total: remedies.length,
        processingTime: Date.now() - startTime,
        apiVersion: "1.0",
        source: source === "demo" ? ("fallback" as const) : source,
      }),
      { status: 200, headers: { "Cache-Control": CACHE_CONTROL } },
    );
  } catch (error) {
    log.error("Error in search API", error);
    return NextResponse.json(errorResponseFromError(error, "INTERNAL_ERROR"), {
      status: getStatusCode("INTERNAL_ERROR"),
    });
  }
}
