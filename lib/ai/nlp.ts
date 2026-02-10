/**
 * Natural Language Query Processing
 *
 * Uses AI to extract intent and entities from user queries.
 */

import { getOpenAIClient } from "./client";
import { buildNLPPrompt } from "./prompts";
import type { NLPQueryResult } from "./types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("ai-nlp");

/**
 * Process natural language query to extract intent and entities
 */
export async function processNaturalLanguageQuery(
  query: string,
): Promise<NLPQueryResult> {
  const client = getOpenAIClient();
  if (!client) {
    return { intent: "search" };
  }

  try {
    const prompt = buildNLPPrompt(query);

    const completion = await client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response);
  } catch (error) {
    logger.error("NLP processing error", error);
    return { intent: "search" };
  }
}
