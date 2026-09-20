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
  /**
   * How the remedy relates to the drug: "Alternative", "Complementary" or
   * "Supportive". Shown so a supportive suggestion is not mistaken for a
   * substitute for someone's medication.
   */
  replacementType?: string;
}

export interface AIRemedyInfo {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  matchingNutrients?: string[];
  /**
   * The claim-limiting label, as certified by the mapping policy.
   *
   * lib/ai/matching.ts runs every AI recommendation through
   * certifyReplacementType() and drops the ones it refuses, so this is a
   * policy decision and not the model's opinion. It was missing from this
   * interface, which is why the field existed on the wire and on SearchResult
   * but could not travel between them.
   */
  replacementType?: string;
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

/**
 * A stated reason the search will not answer, as opposed to having found
 * nothing. The two must never render the same way: an empty list presented for
 * a refusal reads as "no interactions known", which is the one confusion the
 * mapping policy exists to prevent.
 */
export interface SearchRefusal {
  reason: string;
  message: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  resultsCount: number;
  searchedAt: Date;
}
