/**
 * AI-Enhanced Remedy Matching
 *
 * Uses OpenAI GPT-4 to provide intelligent natural remedy recommendations.
 */

import { prisma } from "../db";
import { getOpenAIClient } from "./client";
import { buildMatchingPrompt, SYSTEM_PROMPT } from "./prompts";
import type {
  AIMatchingOptions,
  AIRemedyRecommendation,
  RawAIRecommendation,
  RawDatabaseRemedy,
} from "./types";

/**
 * Parse AI response into structured recommendations
 */
function parseAIResponse(
  response: string,
  allRemedies: RawDatabaseRemedy[],
): AIRemedyRecommendation[] {
  try {
    const parsed = JSON.parse(response);

    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      return parsed.recommendations
        .map((rec: RawAIRecommendation) => {
          const remedy = allRemedies.find(
            (r) => r.name.toLowerCase() === rec.remedyName.toLowerCase(),
          );

          if (!remedy) return null;

          return {
            remedy: {
              id: remedy.id,
              name: remedy.name,
              description: remedy.description || "",
              category: remedy.category,
              matchingNutrients: JSON.parse(remedy.ingredients) as string[],
              similarityScore: rec.confidence,
              imageUrl: remedy.imageUrl || "",
            },
            confidence: rec.confidence,
            reasoning: rec.reasoning,
            warnings: rec.warnings,
            interactions: rec.interactions,
          };
        })
        .filter(
          (r: AIRemedyRecommendation | null): r is AIRemedyRecommendation =>
            r !== null,
        );
    }
  } catch (error) {
    console.error("Failed to parse AI response:", error);
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
): Promise<AIRemedyRecommendation[]> {
  const { query, userHistory, currentMedications, symptoms, preferences } =
    options;

  try {
    const client = getOpenAIClient();
    if (!client) {
      return [];
    }

    const allRemedies = await prisma.naturalRemedy.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    const remediesContext = allRemedies
      .map(
        (r) =>
          `- ${r.name} (${r.category}): ${r.description} | Ingredients: ${r.ingredients}`,
      )
      .join("\n");

    const prompt = buildMatchingPrompt({
      query,
      remediesContext,
      userHistory,
      currentMedications,
      symptoms,
      preferences,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    return parseAIResponse(response, allRemedies);
  } catch (error) {
    console.error("AI matching error:", error);
    return [];
  }
}
