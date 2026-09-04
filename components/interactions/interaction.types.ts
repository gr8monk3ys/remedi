import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  type LucideIcon,
} from "lucide-react";

/** Interaction data returned from the API */
export interface Interaction {
  id: string;
  substanceA: string;
  substanceAType: string;
  substanceB: string;
  substanceBType: string;
  severity: string;
  description: string;
  mechanism: string | null;
  recommendation: string | null;
  evidence: string | null;
  sources: string[];
}

/** API response shape for the check endpoint */
export interface CheckResponse {
  interactions: Interaction[];
  substancesChecked: string[];
  pairsChecked: number;
  interactionsFound: number;
}

/**
 * Severity configuration for visual styling.
 *
 * `icon` carries the severity in shape as well as hue. Colour is the only
 * thing separating one card's border and icon from another's, and while the
 * Severity Badge's text keeps that inside WCAG 2.2 AA, a reader scanning a
 * list of interactions on a phone reads the glyph before the label. The shapes
 * separate the three actions — never combine, take care, no action — while the
 * badge continues to name the degree.
 */
export const SEVERITY_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: LucideIcon;
  }
> = {
  contraindicated: {
    label: "Contraindicated",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950",
    borderColor: "border-red-300 dark:border-red-800",
    icon: ShieldX,
  },
  severe: {
    label: "Severe",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    borderColor: "border-red-200 dark:border-red-900",
    icon: ShieldAlert,
  },
  moderate: {
    label: "Moderate",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    borderColor: "border-orange-200 dark:border-orange-900",
    icon: ShieldAlert,
  },
  mild: {
    label: "Mild",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
    borderColor: "border-yellow-200 dark:border-yellow-900",
    icon: ShieldCheck,
  },
};

/** Evidence level labels */
export const EVIDENCE_LABELS: Record<string, string> = {
  established: "Established",
  theoretical: "Theoretical",
  case_report: "Case Report",
};
