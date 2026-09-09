/**
 * Drug Interaction Checking
 *
 * Uses AI to analyze potential interactions between natural remedies and medications.
 */

import { z } from "zod";
import { getOpenAIClient, openaiCircuitBreaker } from "./client";
import { CircuitBreakerOpenError } from "@/lib/circuit-breaker";
import { buildInteractionPrompt, INTERACTION_SYSTEM_PROMPT } from "./prompts";
import type { DrugInteractionResult } from "./types";
import { known, unknown, type Outcome } from "@/lib/outcome";
import { createLogger } from "@/lib/logger";

/** Why an AI interaction check produced no verdict. */
export type InteractionCheckRefusal = "unavailable";

/**
 * The result of asking the model about interactions.
 *
 * This used to return a sentinel on failure — `hasInteractions: true` with a
 * "unable to verify" warning — which is safe in direction but dishonest in
 * kind: it asserts an interaction that was never found, in the subsystem where
 * a fabricated verdict matters most. A caller could not tell a real moderate
 * interaction from an outage, and neither could a reader.
 */
export type InteractionCheckOutcome = Outcome<
  DrugInteractionResult,
  InteractionCheckRefusal
>;

const UNVERIFIABLE =
  "We could not verify interactions right now. This is not a confirmation that none exist.";

/** Expected shape of the model's interaction verdict. */
const interactionResultSchema = z.object({
  hasInteractions: z.boolean(),
  warnings: z.array(z.string()).default([]),
  severity: z.enum(["low", "moderate", "high"]).catch("moderate"),
  recommendations: z.array(z.string()).default([]),
});

const logger = createLogger("ai-interactions");

/**
 * Check for drug interactions using AI
 */
export async function checkDrugInteractions(
  remedyName: string,
  medications: string[],
): Promise<InteractionCheckOutcome> {
  if (medications.length === 0) {
    // Nothing to check against is a genuine, established "none".
    return known({
      hasInteractions: false,
      warnings: [],
      severity: "low",
      recommendations: [],
    });
  }

  const client = getOpenAIClient();
  if (!client) {
    return unknown("unavailable", UNVERIFIABLE);
  }

  try {
    const prompt = buildInteractionPrompt(remedyName, medications);

    const completion = await openaiCircuitBreaker.call(() =>
      client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: INTERACTION_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    );

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    // This output is presented as drug-safety information, so an unexpected
    // shape must fall back to the conservative "consult a professional"
    // response rather than being rendered as a verdict.
    const parsed = interactionResultSchema.safeParse(JSON.parse(response));
    if (!parsed.success) {
      logger.warn("Interaction response did not match the expected shape");
      throw new Error("Malformed interaction response");
    }
    return known(parsed.data);
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      logger.warn("OpenAI circuit breaker is open, skipping interaction check");
    } else {
      logger.error("Drug interaction check error", error);
    }
    // Not a fabricated verdict. The caller has to render "we could not check"
    // as its own state, which is the only honest thing to show here.
    return unknown("unavailable", UNVERIFIABLE);
  }
}
