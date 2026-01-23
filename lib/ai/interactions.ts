/**
 * Drug Interaction Checking
 *
 * Uses AI to analyze potential interactions between natural remedies and medications.
 */

import { getOpenAIClient } from "./client";
import { buildInteractionPrompt, INTERACTION_SYSTEM_PROMPT } from "./prompts";
import type { DrugInteractionResult } from "./types";

/**
 * Check for drug interactions using AI
 */
export async function checkDrugInteractions(
  remedyName: string,
  medications: string[],
): Promise<DrugInteractionResult> {
  if (medications.length === 0) {
    return {
      hasInteractions: false,
      warnings: [],
      severity: "low",
      recommendations: [],
    };
  }

  const client = getOpenAIClient();
  if (!client) {
    return {
      hasInteractions: true,
      warnings: [
        "AI interaction checking unavailable. Please consult a healthcare provider.",
      ],
      severity: "moderate",
      recommendations: [
        "Speak with your doctor or pharmacist before combining remedies with medications.",
      ],
    };
  }

  try {
    const prompt = buildInteractionPrompt(remedyName, medications);

    const completion = await client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: INTERACTION_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response);
  } catch (error) {
    console.error("Drug interaction check error:", error);
    return {
      hasInteractions: true,
      warnings: ["Unable to verify interactions. Consult healthcare provider."],
      severity: "moderate",
      recommendations: [
        "Speak with your doctor or pharmacist before combining.",
      ],
    };
  }
}
