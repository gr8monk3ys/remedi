/**
 * AI-Enhanced Remedy Matching
 *
 * Uses OpenAI GPT-4 to provide intelligent natural remedy recommendations.
 */

import { z } from "zod";
import { prisma } from "../db";
import { getOpenAIClient, openaiCircuitBreaker } from "./client";
import { CircuitBreakerOpenError } from "@/lib/circuit-breaker";
import { buildMatchingPrompt, SYSTEM_PROMPT } from "./prompts";
import { createLogger } from "@/lib/logger";
import {
  MIN_DISPLAY_SIMILARITY,
  certifyReplacementType,
  neverMappedReason,
  replacementTypeForScore,
  type MappingRefusal,
  type PolicyIdentity,
} from "@/lib/remedy-matcher";
import { known, unknown, type Outcome } from "@/lib/outcome";

const logger = createLogger("ai-matching");
import type {
  AIMatchingOptions,
  AIRemedyRecommendation,
  RawAIRecommendation,
  RawDatabaseRemedy,
} from "./types";

/** Maximum remedies described to the model in one prompt. */
const CANDIDATE_LIMIT = 50;

/**
 * Shape we require back from the model. Anything that does not conform is
 * discarded rather than trusted: this content is shown as health information,
 * so a malformed or hallucinated field must not flow through untyped.
 */
const aiRecommendationSchema = z.object({
  remedyName: z.string().min(1),
  confidence: z.number().min(0).max(1).catch(0.5),
  reasoning: z.string().default(""),
  warnings: z.array(z.string()).optional(),
  interactions: z.array(z.string()).optional(),
});

const aiResponseSchema = z.object({
  recommendations: z.array(aiRecommendationSchema).default([]),
});

/**
 * Choose the remedies offered to the model, ranked by textual relevance to the
 * query so the whole catalogue is reachable.
 */
async function selectCandidateRemedies(
  query: string,
  symptoms?: string[],
): Promise<RawDatabaseRemedy[]> {
  const terms = [query, ...(symptoms ?? [])]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);

  if (terms.length === 0) {
    return prisma.naturalRemedy.findMany({ take: CANDIDATE_LIMIT });
  }

  const matches = await prisma.naturalRemedy.findMany({
    where: {
      OR: terms.flatMap((term) => [
        { name: { contains: term, mode: "insensitive" as const } },
        { description: { contains: term, mode: "insensitive" as const } },
        { category: { contains: term, mode: "insensitive" as const } },
        { benefits: { hasSome: [term] } },
      ]),
    },
    take: CANDIDATE_LIMIT,
  });

  if (matches.length >= CANDIDATE_LIMIT) {
    return matches;
  }

  // Top up with other remedies so the model still has room to suggest
  // something the keyword filter missed.
  const filler = await prisma.naturalRemedy.findMany({
    where: { id: { notIn: matches.map((m) => m.id) } },
    take: CANDIDATE_LIMIT - matches.length,
  });

  return [...matches, ...filler];
}

/**
 * What an AI matching request produced: recommendations, or a refusal.
 *
 * `known` with an empty array means the model had nothing to offer. `unknown`
 * means the policy declined to answer at all. They are different facts and a
 * caller must not render them the same way.
 */
export type AIMatchingOutcome = Outcome<
  AIRemedyRecommendation[],
  MappingRefusal
>;

/**
 * The Substance Identity a request is about, as far as the policy is concerned.
 *
 * The AI path has no Pharmaceutical record to reason from — the person typed a
 * question and may have listed a Medication Cabinet. Both name substances, so
 * both feed identity, and the same rules that govern a generated Remedy Mapping
 * apply here.
 *
 * Symptoms are deliberately excluded. They describe how someone feels, not what
 * they take, and folding them in meant a symptom whose text happened to contain
 * a refused substance emptied the whole result set.
 */
function substanceIdentityFor(options: AIMatchingOptions): PolicyIdentity {
  return {
    name: options.query,
    category: "",
    ingredients: [...(options.currentMedications ?? [])],
  };
}

/**
 * Parse AI response into structured recommendations
 */
function parseAIResponse(
  response: string,
  allRemedies: RawDatabaseRemedy[],
  identity: PolicyIdentity,
): AIRemedyRecommendation[] {
  try {
    const parsedJson: unknown = JSON.parse(response);
    const validated = aiResponseSchema.safeParse(parsedJson);

    if (!validated.success) {
      logger.warn("AI response did not match the expected shape", {
        issues: validated.error.issues.slice(0, 3),
      });
      return [];
    }

    const parsed = validated.data;

    // flatMap drops non-matches without an intermediate nullable array. A
    // recommendation naming a remedy we don't stock is discarded, so the model
    // cannot invent remedies that aren't in the catalogue.
    return parsed.recommendations.flatMap(
      (rec: RawAIRecommendation): AIRemedyRecommendation[] => {
        const remedy = allRemedies.find(
          (r) => r.name.toLowerCase() === rec.remedyName.toLowerCase(),
        );

        if (!remedy) return [];

        // The model's confidence is scored on the same scale as a Similarity
        // Score and rendered in the same place, so it answers to the same
        // display floor. Zod defaults an unparseable confidence to 0.5, which
        // is how a model returning nothing useful could still clear the bar.
        if (rec.confidence < MIN_DISPLAY_SIMILARITY) return [];

        // Whether the drug is mappable at all was settled before the model
        // was called; what is left is the demotion this mapping may need.
        const certified = certifyReplacementType(
          identity,
          replacementTypeForScore(rec.confidence),
        );

        if (certified.kind === "unknown") return [];

        return [
          {
            remedy: {
              id: remedy.id,
              name: remedy.name,
              description: remedy.description || "",
              category: remedy.category,
              matchingNutrients: remedy.ingredients,
              similarityScore: rec.confidence,
              imageUrl: remedy.imageUrl || "",
              replacementType: certified.data,
            },
            confidence: rec.confidence,
            reasoning: rec.reasoning,
            warnings: rec.warnings,
            interactions: rec.interactions,
          },
        ];
      },
    );
  } catch (error) {
    logger.error("Failed to parse AI response", error);
  }

  return [];
}

/**
 * Enhance remedy matching using AI
 *
 * Uses GPT-4 to analyze user query and provide intelligent recommendations.
 * Falls back to empty array if AI is unavailable.
 */
export async function enhanceRemedyMatching(
  options: AIMatchingOptions,
): Promise<AIMatchingOutcome> {
  const { query, userHistory, currentMedications, symptoms, preferences } =
    options;

  const identity = substanceIdentityFor(options);

  // Refuse before the model is called, not after. Whether a drug may carry a
  // Remedy Mapping at all is a property of the request, so filtering the
  // model's output would have left a refusal looking exactly like a search
  // that happened to return nothing — the collapse this policy exists to
  // prevent. It also means we do not pay to ask a question we will discard.
  const refusal = neverMappedReason(identity);
  if (refusal) {
    return unknown("never-mapped", refusal);
  }

  try {
    const client = getOpenAIClient();
    if (!client) {
      return known([]);
    }

    // Pick candidates by relevance to the query, not by insertion order.
    // `orderBy: createdAt desc` meant the model only ever saw the 50 most
    // recently seeded remedies, so most of the catalogue could never be
    // recommended.
    const allRemedies = await selectCandidateRemedies(query, symptoms);

    const remediesContext = allRemedies
      .map((r) => {
        const ingredients = Array.isArray(r.ingredients)
          ? r.ingredients.join(", ")
          : r.ingredients;
        return `- ${r.name} (${r.category}): ${r.description} | Ingredients: ${ingredients}`;
      })
      .join("\n");

    const prompt = buildMatchingPrompt({
      query,
      remediesContext,
      userHistory,
      currentMedications,
      symptoms,
      preferences,
    });

    const completion = await openaiCircuitBreaker.call(() =>
      client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        // Without JSON mode the model often wraps output in ```json fences,
        // which fails JSON.parse and silently produced "no results".
        response_format: { type: "json_object" },
      }),
    );

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    return known(parseAIResponse(response, allRemedies, identity));
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      logger.warn("OpenAI circuit breaker is open, skipping AI matching");
    } else {
      logger.error("AI matching error", error);
    }
    return known([]);
  }
}
