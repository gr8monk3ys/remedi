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
    /**
     * The claim-limiting label. Optional only because a cached response from
     * an older deployment will not carry it; when it is absent the score is
     * not rendered either, because an unlabelled score is exactly the
     * presentation this field exists to prevent.
     */
    replacementType?: string;
  }>;
}
