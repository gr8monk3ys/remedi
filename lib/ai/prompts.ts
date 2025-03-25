/**
 * AI Prompts and Prompt Building
 */

/**
 * System prompt for AI remedy matching
 */
export const SYSTEM_PROMPT = `You are a knowledgeable natural medicine expert and herbalist. Your role is to recommend evidence-based natural remedies as alternatives to pharmaceutical drugs.

Guidelines:
1. ALWAYS prioritize user safety - mention any potential risks or interactions
2. Provide clear reasoning for each recommendation
3. Consider scientific evidence levels (strong, moderate, limited)
4. Warn about drug interactions if current medications are provided
5. Be honest about limitations - if evidence is weak, say so
6. Never claim natural remedies can cure serious diseases
7. Always recommend consulting a healthcare provider
8. Focus on complementary approaches, not replacements

Response Format (JSON):
{
  "recommendations": [
    {
      "remedyName": "Turmeric",
      "confidence": 0.85,
      "reasoning": "Contains curcumin with proven anti-inflammatory properties...",
      "warnings": ["May interact with blood thinners"],
      "interactions": ["warfarin", "aspirin"]
    }
  ]
}`;

/**
 * System prompt for drug interaction checking
 */
export const INTERACTION_SYSTEM_PROMPT =
  "You are a clinical pharmacist specializing in drug-herb interactions. Provide evidence-based safety information.";

/**
 * Build AI prompt for remedy matching
 */
export function buildMatchingPrompt(params: {
  query: string;
  remediesContext: string;
  userHistory?: string[];
  currentMedications?: string[];
  symptoms?: string[];
  preferences?: {
    evidenceLevel?: string;
    category?: string[];
  };
}): string {
  const {
    query,
    remediesContext,
    userHistory,
    currentMedications,
    symptoms,
    preferences,
  } = params;

  let prompt = `User Query: "${query}"\n\n`;

  if (symptoms && symptoms.length > 0) {
    prompt += `Symptoms: ${symptoms.join(", ")}\n\n`;
  }

  if (currentMedications && currentMedications.length > 0) {
    prompt += `Current Medications: ${currentMedications.join(", ")}\n`;
    prompt += `IMPORTANT: Check for interactions with these medications!\n\n`;
  }

  if (userHistory && userHistory.length > 0) {
    prompt += `Previous Searches: ${userHistory.slice(0, 5).join(", ")}\n\n`;
  }

  if (preferences?.evidenceLevel) {
    prompt += `Preferred Evidence Level: ${preferences.evidenceLevel}\n\n`;
  }

  if (preferences?.category && preferences.category.length > 0) {
    prompt += `Preferred Categories: ${preferences.category.join(", ")}\n\n`;
  }

  prompt += `Available Natural Remedies in Database:\n${remediesContext}\n\n`;

  prompt += `Please recommend the top 3-5 most relevant natural remedies from the database above. Consider safety, efficacy, and scientific evidence. Provide detailed reasoning for each recommendation.`;

  return prompt;
}

/**
 * Build prompt for drug interaction checking
 */
export function buildInteractionPrompt(
  remedyName: string,
  medications: string[],
): string {
  return `Analyze potential drug interactions between the natural remedy "${remedyName}" and these medications: ${medications.join(", ")}.

Provide a safety analysis including:
1. Are there any known interactions?
2. Severity level (low/moderate/high)
3. Specific warnings
4. Recommendations for safe use

Response Format (JSON):
{
  "hasInteractions": true,
  "warnings": ["List of specific warnings"],
  "severity": "moderate",
  "recommendations": ["Consult healthcare provider", "Monitor blood pressure"]
}`;
}

/**
 * Build prompt for NLP query analysis
 */
export function buildNLPPrompt(query: string): string {
  return `Analyze this user query about natural remedies and extract key information:

Query: "${query}"

Determine:
1. Primary intent (search/recommendation/interaction_check/information)
2. Any pharmaceutical drugs mentioned
3. Symptoms mentioned
4. Preferred remedy categories (herbal, supplement, food, etc.)
5. Any health concerns or conditions mentioned

Response Format (JSON):
{
  "intent": "recommendation",
  "pharmaceuticalMentioned": "ibuprofen",
  "symptomsMentioned": ["joint pain", "inflammation"],
  "preferredCategories": ["herbal"],
  "concerns": ["stomach sensitivity"]
}`;
}
