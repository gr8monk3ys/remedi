import type { DetailedRemedy } from "@/lib/types";

/**
 * Evidence level UI configuration with colors and descriptions
 */
export const EVIDENCE_LEVEL_CONFIG: Record<
  string,
  { color: string; bgColor: string; description: string }
> = {
  Strong: {
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    description: "Multiple high-quality clinical trials",
  },
  Moderate: {
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Some clinical evidence available",
  },
  Limited: {
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    description: "Preliminary or limited studies",
  },
  Traditional: {
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    description: "Based on traditional use",
  },
};

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
