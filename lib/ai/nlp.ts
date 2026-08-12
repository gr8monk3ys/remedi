/**
 * Natural Language Query Processing
 *
 * Uses AI to extract intent and entities from user queries.
 */

import { z } from "zod";
import { getOpenAIClient, openaiCircuitBreaker } from "./client";
import { CircuitBreakerOpenError } from "@/lib/circuit-breaker";
import { buildNLPPrompt } from "./prompts";
import type { NLPQueryResult } from "./types";
import { createLogger } from "@/lib/logger";

/** Expected shape of the model's query analysis. */
const nlpResultSchema = z.object({
  intent: z
    .enum(["search", "recommendation", "interaction_check", "information"])
    .catch("search"),
  pharmaceuticalMentioned: z.string().optional(),
  symptomsMentioned: z.array(z.string()).optional(),
  preferredCategories: z.array(z.string()).optional(),
  concerns: z.array(z.string()).optional(),
});

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

    const completion = await openaiCircuitBreaker.call(() =>
      client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
    );

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    // Validate rather than trust: an unexpected shape here would flow into
    // search behaviour as if the model had understood the query.
    const parsed = nlpResultSchema.safeParse(JSON.parse(response));
    if (!parsed.success) {
      logger.warn("NLP response did not match the expected shape");
      return { intent: "search" };
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      logger.warn("OpenAI circuit breaker is open, skipping NLP processing");
    } else {
      logger.error("NLP processing error", error);
    }
    return { intent: "search" };
  }
}
