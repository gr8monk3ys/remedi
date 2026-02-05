import { NextRequest, NextResponse } from "next/server";
import { getNaturalRemedyById, toDetailedRemedy } from "@/lib/db";
import { remedyIdSchema } from "@/lib/validations/api";
import {
  successResponse,
  errorResponse,
  errorResponseFromError,
  getStatusCode,
} from "@/lib/api/response";
import { createLogger } from "@/lib/logger";
import { trackUserEventSafe } from "@/lib/analytics/user-events";
import type { DetailedRemedy } from "@/lib/types";

const log = createLogger("remedy-api");

// Mock database of detailed remedy information
const DETAILED_REMEDIES: Record<string, DetailedRemedy> = {
  // Vitamin D3 Alternatives
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
      "Spend 15-30 minutes in direct sunlight a few times a week, with arms and legs exposed (without sunscreen for this period). The body naturally produces vitamin D when skin is exposed to sunlight.",
    dosage:
      "15-30 minutes of sun exposure to face, arms, and legs 2-3 times per week is typically sufficient for most individuals. People with darker skin may need more time.",
    precautions:
      "Avoid sunburn. Limit exposure during peak sun hours (10 am - 4 pm). People with skin cancer history, photosensitivity, or taking photosensitizing medications should consult their doctor before increasing sun exposure.",
    scientificInfo:
      "When UVB rays from the sun hit the skin, they interact with a protein called 7-dehydrocholesterol (7-DHC). This interaction converts 7-DHC into previtamin D3, which then becomes vitamin D3. This molecule travels through the bloodstream to the liver and kidneys where it's converted to its active form, calcitriol.",
    references: [
      {
        title: "Vitamin D: The 'sunshine' vitamin",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3356951/",
      },
      {
        title: "Sunlight and Vitamin D: A global perspective for health",
        url: "https://www.tandfonline.com/doi/full/10.4161/derm.24494",
      },
    ],
    relatedRemedies: [
      { id: "102", name: "Fatty Fish" },
      { id: "103", name: "Mushrooms" },
    ],
  },
  "102": {
    id: "102",
    name: "Fatty Fish",
    description: "Salmon, mackerel, and other fatty fish rich in vitamin D.",
    imageUrl:
      "https://images.unsplash.com/photo-1599160689894-193dafc2e8b2?w=400&h=400&fit=crop",
    category: "Food Source",
    matchingNutrients: ["Vitamin D3", "Omega-3"],
    similarityScore: 0.8,
    usage:
      "Include fatty fish like salmon, mackerel, sardines, or herring in your diet regularly. They are among the few natural food sources of vitamin D.",
    dosage:
      "Consuming fatty fish 2-3 times per week is recommended. A 3.5-ounce (100-gram) serving of fatty fish can provide 200–700 IU of vitamin D.",
    precautions:
      "Be mindful of mercury content in some fish. Pregnant women and young children should follow specific guidelines about fish consumption. People with fish allergies should avoid this remedy.",
    scientificInfo:
      "Fatty fish contain vitamin D in the form of D3 (cholecalciferol), which is the same form your skin produces when exposed to sunlight. Fatty fish are also excellent sources of omega-3 fatty acids, which provide additional health benefits for heart and brain health.",
    references: [
      {
        title: "Vitamin D in Fish: A Valuable Source of Vitamin D",
        url: "https://www.mdpi.com/2072-6643/10/12/1876",
      },
      {
        title: "Omega-3 Fatty Acids and Heart Health",
        url: "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/fish-and-omega-3-fatty-acids",
      },
    ],
    relatedRemedies: [
      { id: "101", name: "Sunlight Exposure" },
      { id: "104", name: "Wild-Caught Fatty Fish" },
    ],
  },

  // Turmeric (for Ibuprofen alternative)
  "103": {
    id: "103",
    name: "Turmeric",
    description: "Contains curcumin which has anti-inflammatory properties.",
    imageUrl:
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop",
    category: "Herbal Remedy",
    matchingNutrients: ["Curcumin"],
    similarityScore: 0.85,
    usage:
      "Turmeric can be used in cooking, taken as a supplement, or made into a paste for topical application. For inflammation and pain relief, it's often consumed with black pepper to enhance absorption.",
    dosage:
      "The recommended dosage is typically 500-2,000 mg of turmeric extract per day. For cooking, 1-2 teaspoons of ground turmeric per day can be added to foods.",
    precautions:
      "May interact with blood thinners, diabetes medications, and acid-reducing medications. Not recommended in high doses during pregnancy. Can cause digestive discomfort in some people.",
    scientificInfo:
      "The active compound in turmeric, curcumin, inhibits the activity of cyclooxygenase-2 (COX-2) and 5-lipoxygenase (5-LOX) enzymes, as well as other enzymes that produce inflammatory compounds. This mechanism is similar to how NSAIDs like ibuprofen work, though through slightly different pathways.",
    references: [
      {
        title: "Curcumin: A Review of Its Effects on Human Health",
        url: "https://www.mdpi.com/2072-6643/9/10/1047",
      },
      {
        title:
          "Anti-inflammatory properties of curcumin, a major constituent of Curcuma longa",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0958166909000251",
      },
    ],
    relatedRemedies: [
      { id: "104", name: "Ginger" },
      { id: "105", name: "Willow Bark" },
    ],
  },

  // Tart Cherry Juice (for Melatonin alternative)
  "104": {
    id: "104",
    name: "Ginger",
    description: "Root with anti-inflammatory and digestive properties.",
    imageUrl:
      "https://images.unsplash.com/photo-1603431213662-4862e7a29051?w=400&h=400&fit=crop",
    category: "Herbal Remedy",
    matchingNutrients: ["Gingerols", "Shogaols"],
    similarityScore: 0.8,
    usage:
      "Can be used fresh, dried, powdered, or as an oil or juice. Add to foods, brew as tea, or take as a supplement.",
    dosage:
      "1-2g of ginger powder, 1-2 teaspoons of fresh ginger, or 400-500mg of extract 2-3 times daily.",
    precautions:
      "May interact with blood thinners and diabetes medications. High doses might cause mild heartburn or irritation.",
    scientificInfo:
      "Ginger contains compounds called gingerols and shogaols that have powerful anti-inflammatory and antioxidant effects. These compounds inhibit the production of pro-inflammatory cytokines and the activity of cyclooxygenase enzymes, which are targets of traditional NSAIDs.",
    references: [
      {
        title: "Ginger on Human Health: A Comprehensive Systematic Review",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7019938/",
      },
      {
        title: "Anti-Inflammatory Effects of Ginger and Some of its Components",
        url: "https://pubmed.ncbi.nlm.nih.gov/27251915/",
      },
    ],
    relatedRemedies: [
      { id: "103", name: "Turmeric" },
      { id: "105", name: "Willow Bark" },
    ],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const { id } = await params;
    log.debug("Fetching remedy details", { id });

    // Validate ID parameter
    const validation = remedyIdSchema.safeParse(id);
    if (!validation.success) {
      const errorMessage =
        validation.error.issues[0]?.message || "Invalid remedy ID";
      log.debug("Validation failed", { error: errorMessage });
      return NextResponse.json(
        errorResponse("INVALID_INPUT", errorMessage, {
          issues: validation.error.issues,
        }),
        { status: getStatusCode("INVALID_INPUT") },
      );
    }

    // First try to fetch from database
    const dbRemedy = await getNaturalRemedyById(id);

    if (dbRemedy) {
      const detailedRemedy = toDetailedRemedy(dbRemedy);
      log.info("Returning remedy from database", { name: detailedRemedy.name });
      await trackUserEventSafe({
        request,
        userId,
        sessionId,
        eventType: "view_remedy",
        eventData: {
          remedyId: id,
          source: "database",
          processingTimeMs: Date.now() - startTime,
        },
      });
      const processingTime = Date.now() - startTime;
      return NextResponse.json(
        successResponse(detailedRemedy, {
          processingTime,
          apiVersion: "1.0",
        }),
        { status: 200 },
      );
    }

    // Fallback to mock data if not in database
    const mockRemedy = DETAILED_REMEDIES[id];

    if (!mockRemedy) {
      log.info("Remedy not found", { id });
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", `Remedy with ID ${id} not found`),
        { status: getStatusCode("RESOURCE_NOT_FOUND") },
      );
    }

    log.info("Returning remedy from mock data", { name: mockRemedy.name });
    await trackUserEventSafe({
      request,
      userId,
      sessionId,
      eventType: "view_remedy",
      eventData: {
        remedyId: id,
        source: "mock",
        processingTimeMs: Date.now() - startTime,
      },
    });
    const processingTime = Date.now() - startTime;
    return NextResponse.json(
      successResponse(mockRemedy, {
        processingTime,
        apiVersion: "1.0",
      }),
      { status: 200 },
    );
  } catch (error) {
    log.error("Error fetching remedy details", error);
    return NextResponse.json(errorResponseFromError(error, "INTERNAL_ERROR"), {
      status: getStatusCode("INTERNAL_ERROR"),
    });
  }
}
