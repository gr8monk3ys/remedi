/**
 * Shared types for search components
 */

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  matchingNutrients: string[];
  similarityScore?: number;
  category?: string;
}

export interface AIRemedyInfo {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  matchingNutrients?: string[];
}

export interface AIRecommendation {
  remedy: AIRemedyInfo;
  confidence: number;
  reasoning: string;
}

export interface AIExtractedInfo {
  symptoms?: string[];
  pharmaceutical?: string;
  conditions?: string[];
}

export interface AIInsights {
  intent?: string;
  extractedInfo?: AIExtractedInfo;
  recommendations?: AIRecommendation[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  resultsCount: number;
  searchedAt: Date;
}
