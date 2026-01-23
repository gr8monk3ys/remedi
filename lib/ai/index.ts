/**
 * AI Module
 *
 * AI-powered features for remedy matching, drug interactions, and NLP.
 */

// Client
export { isAIEnabled, getOpenAIClient } from "./client";

// Matching
export { enhanceRemedyMatching } from "./matching";

// Interactions
export { checkDrugInteractions } from "./interactions";

// NLP
export { processNaturalLanguageQuery } from "./nlp";

// Types
export type {
  AIMatchingOptions,
  AIRemedyRecommendation,
  DrugInteractionResult,
  NLPQueryResult,
} from "./types";
