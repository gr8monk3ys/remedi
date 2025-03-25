/**
 * OpenAI Client Management
 *
 * Lazy initialization of OpenAI client to avoid build-time errors.
 */

import OpenAI from "openai";
import { createLogger } from "@/lib/logger";
import { CircuitBreaker } from "@/lib/circuit-breaker";

const logger = createLogger("ai-client");

let openaiClient: OpenAI | null = null;
let aiDisabled = false;

/**
 * Shared circuit breaker for all OpenAI API calls
 */
export const openaiCircuitBreaker = new CircuitBreaker({
  name: "openai",
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
});

/**
 * Check if AI features are available
 */
export function isAIEnabled(): boolean {
  return !aiDisabled && !!process.env.OPENAI_API_KEY;
}

/**
 * Get or create OpenAI client
 */
export function getOpenAIClient(): OpenAI | null {
  if (aiDisabled) {
    return null;
  }

  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logger.warn("OPENAI_API_KEY not configured - AI features disabled");
      aiDisabled = true;
      return null;
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}
