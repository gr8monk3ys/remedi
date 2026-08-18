import type { DetailedRemedy } from "@/lib/types";

/**
 * Extended remedy type with pharmaceutical mappings
 */
export interface CompareRemedy extends DetailedRemedy {
  evidenceLevel?: string;
  benefits?: string[];
  sideEffects?: string[];
  interactions?: string;
  relatedPharmaceuticals?: Array<{
    id: string;
    name: string;
    similarityScore: number;
  }>;
}
