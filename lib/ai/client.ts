/**
 * OpenAI Client Management
 *
 * Lazy initialization of OpenAI client to avoid build-time errors.
 */

import OpenAI from "openai";

let openaiClient: OpenAI | null = null;
let aiDisabled = false;

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
      console.warn("OPENAI_API_KEY not configured - AI features disabled");
      aiDisabled = true;
      return null;
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}
