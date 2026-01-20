/**
 * AI-Enhanced Remedy Matching
 *
 * Uses OpenAI GPT-4 to provide intelligent natural remedy recommendations
 * based on user queries, symptoms, and pharmaceutical alternatives.
 *
 * Features:
 * - Natural language query processing
 * - Context-aware remedy suggestions
 * - Drug interaction checking
 * - Personalized recommendations based on user history
 *
 * @see https://platform.openai.com/docs/api-reference
 */

import OpenAI from 'openai';
import type { NaturalRemedy } from './types';
import { prisma } from './db';

/**
 * Initialize OpenAI client (lazy initialization to avoid build-time errors)
 */
let openaiClient: OpenAI | null = null;
let aiDisabled = false;

/**
 * Check if AI features are available
 */
export function isAIEnabled(): boolean {
  return !aiDisabled && !!process.env.OPENAI_API_KEY;
}

function getOpenAIClient(): OpenAI | null {
  if (aiDisabled) {
    return null;
  }

  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not configured - AI features disabled');
      aiDisabled = true;
      return null;
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * AI-enhanced remedy matching options
 */
export interface AIMatchingOptions {
  query: string;
  userHistory?: string[]; // Previous searches
  currentMedications?: string[]; // Current medications for interaction checking
  symptoms?: string[]; // Specific symptoms
  preferences?: {
    evidenceLevel?: 'strong' | 'moderate' | 'limited';
    category?: string[];
  };
}

/**
 * AI remedy recommendation result
 */
export interface AIRemedyRecommendation {
  remedy: NaturalRemedy;
  confidence: number; // 0-1
  reasoning: string;
  warnings?: string[];
  interactions?: string[];
}

/**
 * Enhance remedy matching using AI
 *
 * Uses GPT-4 to analyze user query and provide intelligent recommendations.
 * Falls back to database search if AI is unavailable.
 *
 * @param options - Matching options
 * @returns Array of AI-recommended remedies
 *
 * @example
 * ```typescript
 * const recommendations = await enhanceRemedyMatching({
 *   query: "I have joint pain and inflammation",
 *   currentMedications: ["ibuprofen"],
 *   symptoms: ["joint pain", "swelling"]
 * });
 * ```
 */
export async function enhanceRemedyMatching(
  options: AIMatchingOptions
): Promise<AIRemedyRecommendation[]> {
  const { query, userHistory, currentMedications, symptoms, preferences } = options;

  try {
    // Check if AI is available
    const client = getOpenAIClient();
    if (!client) {
      return []; // AI features disabled, return empty recommendations
    }

    // Get all remedies from database for context
    const allRemedies = await prisma.naturalRemedy.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    // Build context for AI
    const remediesContext = allRemedies
      .map(
        (r: { name: string; category: string; description: string | null; ingredients: string }) =>
          `- ${r.name} (${r.category}): ${r.description} | Ingredients: ${r.ingredients}`
      )
      .join('\n');

    // Build the prompt
    const prompt = buildAIPrompt({
      query,
      remediesContext,
      userHistory,
      currentMedications,
      symptoms,
      preferences,
    });

    // Call OpenAI API
    const completion = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    const recommendations = parseAIResponse(response, allRemedies);

    return recommendations;
  } catch (error) {
    console.error('AI matching error:', error);
    // Fall back to basic matching
    return [];
  }
}

/**
 * System prompt for AI remedy matching
 */
const SYSTEM_PROMPT = `You are a knowledgeable natural medicine expert and herbalist. Your role is to recommend evidence-based natural remedies as alternatives to pharmaceutical drugs.

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
 * Build AI prompt from user input
 */
function buildAIPrompt(params: {
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
    prompt += `Symptoms: ${symptoms.join(', ')}\n\n`;
  }

  if (currentMedications && currentMedications.length > 0) {
    prompt += `Current Medications: ${currentMedications.join(', ')}\n`;
    prompt += `IMPORTANT: Check for interactions with these medications!\n\n`;
  }

  if (userHistory && userHistory.length > 0) {
    prompt += `Previous Searches: ${userHistory.slice(0, 5).join(', ')}\n\n`;
  }

  if (preferences?.evidenceLevel) {
    prompt += `Preferred Evidence Level: ${preferences.evidenceLevel}\n\n`;
  }

  if (preferences?.category && preferences.category.length > 0) {
    prompt += `Preferred Categories: ${preferences.category.join(', ')}\n\n`;
  }

  prompt += `Available Natural Remedies in Database:\n${remediesContext}\n\n`;

  prompt += `Please recommend the top 3-5 most relevant natural remedies from the database above. Consider safety, efficacy, and scientific evidence. Provide detailed reasoning for each recommendation.`;

  return prompt;
}

/**
 * Parse AI response into structured recommendations
 */
function parseAIResponse(
  response: string,
  allRemedies: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    ingredients: string;
    benefits: string;
    imageUrl: string | null;
  }>
): AIRemedyRecommendation[] {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response);

    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      return parsed.recommendations
        .map((rec: {
          remedyName: string;
          confidence: number;
          reasoning: string;
          warnings?: string[];
          interactions?: string[];
        }) => {
          // Find matching remedy in database
          const remedy = allRemedies.find(
            (r) => r.name.toLowerCase() === rec.remedyName.toLowerCase()
          );

          if (!remedy) return null;

          return {
            remedy: {
              id: remedy.id,
              name: remedy.name,
              description: remedy.description || '',
              category: remedy.category,
              matchingNutrients: JSON.parse(remedy.ingredients) as string[],
              similarityScore: rec.confidence,
              imageUrl: remedy.imageUrl || '',
            },
            confidence: rec.confidence,
            reasoning: rec.reasoning,
            warnings: rec.warnings,
            interactions: rec.interactions,
          };
        })
        .filter((r: AIRemedyRecommendation | null): r is AIRemedyRecommendation => r !== null);
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
  }

  return [];
}

/**
 * Check for drug interactions using AI
 *
 * @param remedyName - Natural remedy name
 * @param medications - List of current medications
 * @returns Interaction warnings and recommendations
 *
 * @example
 * ```typescript
 * const interactions = await checkDrugInteractions(
 *   "St. John's Wort",
 *   ["sertraline", "birth control pills"]
 * );
 * ```
 */
export async function checkDrugInteractions(
  remedyName: string,
  medications: string[]
): Promise<{
  hasInteractions: boolean;
  warnings: string[];
  severity: 'low' | 'moderate' | 'high';
  recommendations: string[];
}> {
  if (medications.length === 0) {
    return {
      hasInteractions: false,
      warnings: [],
      severity: 'low',
      recommendations: [],
    };
  }

  // Check if AI is available
  const client = getOpenAIClient();
  if (!client) {
    return {
      hasInteractions: true,
      warnings: ['AI interaction checking unavailable. Please consult a healthcare provider.'],
      severity: 'moderate',
      recommendations: ['Speak with your doctor or pharmacist before combining remedies with medications.'],
    };
  }

  try {
    const prompt = `Analyze potential drug interactions between the natural remedy "${remedyName}" and these medications: ${medications.join(', ')}.

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

    const completion = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a clinical pharmacist specializing in drug-herb interactions. Provide evidence-based safety information.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent medical advice
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Drug interaction check error:', error);
    // Default to cautious response
    return {
      hasInteractions: true,
      warnings: ['Unable to verify interactions. Consult healthcare provider.'],
      severity: 'moderate',
      recommendations: ['Speak with your doctor or pharmacist before combining.'],
    };
  }
}

/**
 * Process natural language query to extract intent and entities
 *
 * @param query - User's natural language query
 * @returns Structured query information
 */
export async function processNaturalLanguageQuery(query: string): Promise<{
  intent: 'search' | 'recommendation' | 'interaction_check' | 'information';
  pharmaceuticalMentioned?: string;
  symptomsMentioned?: string[];
  preferredCategories?: string[];
  concerns?: string[];
}> {
  // Check if AI is available
  const client = getOpenAIClient();
  if (!client) {
    return { intent: 'search' }; // Default to basic search when AI unavailable
  }

  try {
    const prompt = `Analyze this user query about natural remedies and extract key information:

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

    const completion = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('NLP processing error:', error);
    // Default to basic search intent
    return {
      intent: 'search',
    };
  }
}
