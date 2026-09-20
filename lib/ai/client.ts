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
/** The key the cached client was built from, so a rotated key is picked up. */
let openaiClientKey: string | null = null;
/** Log the missing-key warning once per process rather than once per request. */
let warnedAboutMissingKey = false;

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
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get or create OpenAI client
 */
export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Deliberately not latched. This used to set `aiDisabled = true` on the
    // first call with no key, and nothing ever cleared it — so configuring the
    // key afterwards did not bring AI search back until the process was
    // replaced. On Vercel that means waiting for a cold start with no way to
    // tell whether it had happened. Absence of a key is a fact about right
    // now, so it is re-read every time; only the warning is rate-limited.
    if (!warnedAboutMissingKey) {
      warnedAboutMissingKey = true;
      logger.warn("OPENAI_API_KEY not configured - AI features disabled");
    }
    return null;
  }

  // Rebuild if the key changed, so a rotated credential takes effect.
  if (!openaiClient || openaiClientKey !== apiKey) {
    openaiClient = new OpenAI({ apiKey });
    openaiClientKey = apiKey;
    warnedAboutMissingKey = false;
  }

  return openaiClient;
}
