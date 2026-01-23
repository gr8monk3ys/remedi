/**
 * AI Module Types
 */

import type { NaturalRemedy } from "../types";

/**
 * AI-enhanced remedy matching options
 */
export interface AIMatchingOptions {
  query: string;
  userHistory?: string[];
  currentMedications?: string[];
  symptoms?: string[];
  preferences?: {
    evidenceLevel?: "strong" | "moderate" | "limited";
    category?: string[];
  };
}

/**
 * AI remedy recommendation result
 */
export interface AIRemedyRecommendation {
  remedy: NaturalRemedy;
  confidence: number;
  reasoning: string;
  warnings?: string[];
  interactions?: string[];
}

/**
 * Drug interaction check result
 */
export interface DrugInteractionResult {
  hasInteractions: boolean;
  warnings: string[];
  severity: "low" | "moderate" | "high";
  recommendations: string[];
}

/**
 * NLP query analysis result
 */
export interface NLPQueryResult {
  intent: "search" | "recommendation" | "interaction_check" | "information";
  pharmaceuticalMentioned?: string;
  symptomsMentioned?: string[];
  preferredCategories?: string[];
  concerns?: string[];
}

/**
 * Raw AI recommendation from OpenAI response
 */
export interface RawAIRecommendation {
  remedyName: string;
  confidence: number;
  reasoning: string;
  warnings?: string[];
  interactions?: string[];
}

/**
 * Raw remedy from database
 */
export interface RawDatabaseRemedy {
  id: string;
  name: string;
  description: string | null;
  category: string;
  ingredients: string;
  benefits: string;
  imageUrl: string | null;
}
