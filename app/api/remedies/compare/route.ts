import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { parseNaturalRemedy } from "@/lib/db/parsers";
import { getCurrentUser } from "@/lib/auth";
import { getEffectivePlanLimits } from "@/lib/trial";
import {
  successResponse,
  errorResponse,
  errorResponseFromError,
  getStatusCode,
} from "@/lib/api/response";
import { createLogger } from "@/lib/logger";
import type { DetailedRemedy, Reference, RelatedRemedy } from "@/lib/types";
import { normalizeReferences } from "@/lib/references";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const log = createLogger("remedies-compare-api");

/**
 * Validation schema for compare request
 */
const compareSchema = z.object({
  ids: z
    .string()
    .min(1, "At least one remedy ID is required")
    .transform((val) => val.split(",").map((id) => id.trim()))
    .refine((ids) => ids.length >= 1, "At least one remedy ID is required")
    .refine(
      (ids) => ids.every((id) => id.length > 0),
      "Invalid remedy ID format",
    )
    .refine((ids) => new Set(ids).size === ids.length, "Duplicate remedy IDs"),
});

/**
 * Extended remedy type for comparison with pharmaceutical mappings
 */
interface CompareRemedy extends DetailedRemedy {
  evidenceLevel?: string;
  benefits: string[];
  sideEffects?: string[];
  interactions?: string;
  relatedPharmaceuticals: Array<{
    id: string;
    name: string;
    category: string;
    similarityScore: number;
  }>;
}

/**
 * Mock remedies for fallback when database is empty
 */
const MOCK_REMEDIES: Record<string, CompareRemedy> = {
  "101": {
    id: "101",
    name: "Sunlight Exposure",
    description:
      "Natural vitamin D production through sunlight exposure on skin.",
    imageUrl:
      "https://images.unsplash.com/photo-1517758478390-c89333af4642?w=400&h=400&fit=crop",
    category: "Lifestyle Change",
    matchingNutrients: ["Vitamin D3"],
    similarityScore: 0.9,
    usage:
      "Spend 15-30 minutes in direct sunlight a few times a week, with arms and legs exposed.",
    dosage: "15-30 minutes of sun exposure 2-3 times per week.",
    precautions:
      "Avoid sunburn. Limit exposure during peak sun hours (10 am - 4 pm).",
    scientificInfo:
      "When UVB rays hit the skin, they convert 7-DHC into vitamin D3.",
    references: [
      {
        title: "Vitamin D: The sunshine vitamin",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3356951/",
      },
    ],
    relatedRemedies: [{ id: "102", name: "Fatty Fish" }],
    evidenceLevel: "Strong",
    benefits: [
      "Natural vitamin D synthesis",
      "Improves mood",
      "Supports bone health",
    ],
    relatedPharmaceuticals: [
      {
        id: "p1",
        name: "Vitamin D3 Supplements",
        category: "Supplement",
        similarityScore: 0.9,
      },
    ],
  },
  "102": {
    id: "102",
    name: "Fatty Fish",
    description: "Salmon, mackerel, and other fatty fish rich in vitamin D.",
    imageUrl:
      "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&h=400&fit=crop",
    category: "Food Source",
    matchingNutrients: ["Vitamin D3", "Omega-3"],
    similarityScore: 0.8,
    usage: "Include fatty fish like salmon or mackerel in your diet regularly.",
    dosage:
      "2-3 servings per week. 3.5-ounce serving provides 200-700 IU vitamin D.",
    precautions:
      "Be mindful of mercury content. Pregnant women should follow guidelines.",
    scientificInfo:
      "Fatty fish contain vitamin D3 (cholecalciferol) naturally.",
    references: [
      {
        title: "Vitamin D in Fish",
        url: "https://www.mdpi.com/2072-6643/10/12/1876",
      },
    ],
    relatedRemedies: [{ id: "101", name: "Sunlight Exposure" }],
    evidenceLevel: "Strong",
    benefits: [
      "Rich in vitamin D",
      "Excellent omega-3 source",
      "Supports heart health",
      "Anti-inflammatory properties",
    ],
    relatedPharmaceuticals: [
      {
        id: "p2",
        name: "Fish Oil Supplements",
        category: "Supplement",
        similarityScore: 0.85,
      },
    ],
  },
  "103": {
    id: "103",
    name: "Turmeric",
    description: "Contains curcumin which has anti-inflammatory properties.",
    imageUrl:
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop",
    category: "Herbal Remedy",
    matchingNutrients: ["Curcumin"],
    similarityScore: 0.85,
    usage: "Can be used in cooking, as supplement, or topical paste.",
    dosage: "500-2,000 mg of turmeric extract per day or 1-2 teaspoons ground.",
    precautions: "May interact with blood thinners and diabetes medications.",
    scientificInfo: "Curcumin inhibits COX-2 and 5-LOX enzymes.",
    references: [
      {
        title: "Curcumin: A Review",
        url: "https://www.mdpi.com/2072-6643/9/10/1047",
      },
    ],
    relatedRemedies: [{ id: "104", name: "Ginger" }],
    evidenceLevel: "Moderate",
    benefits: [
      "Anti-inflammatory",
      "Antioxidant properties",
      "May support joint health",
      "Digestive support",
    ],
    sideEffects: ["Stomach upset at high doses", "May thin blood"],
    interactions: "Blood thinners, diabetes medications, acid-reducing drugs",
    relatedPharmaceuticals: [
      {
        id: "p3",
        name: "Ibuprofen",
        category: "NSAID",
        similarityScore: 0.7,
      },
    ],
  },
  "104": {
    id: "104",
    name: "Ginger",
    description: "Root with anti-inflammatory and digestive properties.",
    imageUrl:
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop",
    category: "Herbal Remedy",
    matchingNutrients: ["Gingerols", "Shogaols"],
    similarityScore: 0.8,
    usage: "Fresh, dried, powdered, or as tea/supplement.",
    dosage:
      "1-2g powder, 1-2 teaspoons fresh, or 400-500mg extract 2-3x daily.",
    precautions:
      "May interact with blood thinners. High doses may cause heartburn.",
    scientificInfo:
      "Contains gingerols and shogaols with anti-inflammatory effects.",
    references: [
      {
        title: "Ginger on Human Health",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7019938/",
      },
    ],
    relatedRemedies: [{ id: "103", name: "Turmeric" }],
    evidenceLevel: "Moderate",
    benefits: [
      "Anti-inflammatory",
      "Relieves nausea",
      "Digestive aid",
      "May reduce muscle pain",
    ],
    sideEffects: ["Heartburn", "Digestive discomfort at high doses"],
    interactions: "Blood thinners, diabetes medications",
    relatedPharmaceuticals: [
      {
        id: "p4",
        name: "Dramamine",
        category: "Anti-nausea",
        similarityScore: 0.6,
      },
    ],
  },
};

/**
 * Convert database remedy to CompareRemedy format
 */
function toCompareRemedy(
  remedy: ReturnType<typeof parseNaturalRemedy>,
  pharmaceuticals: Array<{
    id: string;
    name: string;
    category: string;
    similarityScore: number;
  }> = [],
): CompareRemedy {
  const parsedReferences: Reference[] = normalizeReferences(remedy.references);

  // Parse related remedies
  let parsedRelatedRemedies: RelatedRemedy[] = [];
  if (remedy.relatedRemedies && Array.isArray(remedy.relatedRemedies)) {
    parsedRelatedRemedies = remedy.relatedRemedies.map((rel) => {
      if (typeof rel === "string") {
        try {
          const parsed = JSON.parse(rel);
          return parsed as RelatedRemedy;
        } catch {
          return { id: "", name: rel };
        }
      }
      return rel as RelatedRemedy;
    });
  }

  return {
    id: remedy.id,
    name: remedy.name,
    description: remedy.description || "",
    imageUrl: remedy.imageUrl || "",
    category: remedy.category,
    matchingNutrients: remedy.ingredients || [],
    similarityScore: 1.0,
    usage: remedy.usage || "Usage information not available.",
    dosage: remedy.dosage || "Dosage information not available.",
    precautions: remedy.precautions || "Precaution information not available.",
    scientificInfo:
      remedy.scientificInfo || "Scientific information not available.",
    references: parsedReferences,
    relatedRemedies: parsedRelatedRemedies,
    evidenceLevel: remedy.evidenceLevel || undefined,
    benefits: remedy.benefits || [],
    relatedPharmaceuticals: pharmaceuticals,
  };
}

/**
 * GET /api/remedies/compare?ids=id1,id2,id3
 *
 * Fetch multiple remedies with their related pharmaceutical mappings
 * for detailed side-by-side comparison.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  // Check rate limit (comparisons can be heavier than basic search)
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.general,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: getStatusCode("UNAUTHORIZED") },
      );
    }

    const { limits, plan, isTrial } = await getEffectivePlanLimits(user.id);
    if (!limits.canCompare) {
      return NextResponse.json(
        errorResponse(
          "FORBIDDEN",
          "Remedy comparison is not available on your current plan.",
          { plan, isTrial },
        ),
        { status: getStatusCode("FORBIDDEN") },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        errorResponse("MISSING_PARAMETER", "ids parameter is required"),
        { status: getStatusCode("MISSING_PARAMETER") },
      );
    }

    // Validate input
    const validation = compareSchema.safeParse({ ids: idsParam });
    if (!validation.success) {
      const errorMessage =
        validation.error.issues[0]?.message || "Invalid input";
      log.debug("Validation failed", { error: errorMessage });
      return NextResponse.json(
        errorResponse("INVALID_INPUT", errorMessage, {
          issues: validation.error.issues,
        }),
        { status: getStatusCode("INVALID_INPUT") },
      );
    }

    const { ids } = validation.data;
    log.info("Fetching remedies for comparison", { ids, count: ids.length });

    if (ids.length > limits.maxCompareItems) {
      return NextResponse.json(
        errorResponse(
          "LIMIT_EXCEEDED",
          `Your plan allows comparing up to ${limits.maxCompareItems} remedies at once.`,
          {
            plan,
            isTrial,
            requested: ids.length,
            limit: limits.maxCompareItems,
          },
        ),
        { status: getStatusCode("LIMIT_EXCEEDED") },
      );
    }

    // Fetch remedies with their pharmaceutical mappings
    const dbRemedies = await prisma.naturalRemedy.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        pharmaceuticals: {
          include: {
            pharmaceutical: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
          orderBy: {
            similarityScore: "desc",
          },
          take: 5, // Limit related pharmaceuticals per remedy
        },
      },
    });

    // Parse database results and convert to CompareRemedy format
    const remedies: CompareRemedy[] = [];
    const notFoundIds: string[] = [];
    const dbRemedyMap = new Map<string, CompareRemedy>();

    for (const dbRemedy of dbRemedies) {
      const parsed = parseNaturalRemedy(dbRemedy);
      const pharmaceuticals = dbRemedy.pharmaceuticals.map(
        (mapping: {
          pharmaceutical: { id: string; name: string; category: string };
          similarityScore: number;
        }) => ({
          id: mapping.pharmaceutical.id,
          name: mapping.pharmaceutical.name,
          category: mapping.pharmaceutical.category,
          similarityScore: mapping.similarityScore,
        }),
      );
      dbRemedyMap.set(dbRemedy.id, toCompareRemedy(parsed, pharmaceuticals));
    }

    // Build result array maintaining order and using mock data as fallback
    for (const id of ids) {
      const dbRemedy = dbRemedyMap.get(id);
      if (dbRemedy) {
        remedies.push(dbRemedy);
      } else {
        // Try mock data fallback
        const mockRemedy = MOCK_REMEDIES[id];
        if (mockRemedy) {
          remedies.push(mockRemedy);
        } else {
          notFoundIds.push(id);
        }
      }
    }

    if (remedies.length === 0) {
      return NextResponse.json(
        errorResponse(
          "RESOURCE_NOT_FOUND",
          "No remedies found for the provided IDs",
        ),
        { status: getStatusCode("RESOURCE_NOT_FOUND") },
      );
    }

    const processingTime = Date.now() - startTime;
    log.info("Comparison remedies fetched", {
      found: remedies.length,
      notFound: notFoundIds.length,
      processingTime,
    });

    return NextResponse.json(
      successResponse(
        {
          remedies,
          notFoundIds: notFoundIds.length > 0 ? notFoundIds : undefined,
        },
        {
          processingTime,
          total: remedies.length,
          apiVersion: "1.0",
        },
      ),
      { status: 200 },
    );
  } catch (error) {
    log.error("Error fetching comparison remedies", error);
    return NextResponse.json(errorResponseFromError(error, "DATABASE_ERROR"), {
      status: getStatusCode("DATABASE_ERROR"),
    });
  }
}
