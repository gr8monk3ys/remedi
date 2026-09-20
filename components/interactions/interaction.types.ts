import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
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
export interface SeverityPresentation {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
  /** Badge styling, kept here so the three call sites cannot disagree. */
  badgeVariant: "destructive" | "default" | "secondary" | "outline";
  /**
   * True only for the four severities we actually understand. `false` means
   * the row carried a value this build has never seen, and the presentation
   * must say so rather than pick a degree on the reader's behalf.
   */
  known: boolean;
}

export const SEVERITY_CONFIG: Record<string, SeverityPresentation> = {
  contraindicated: {
    label: "Contraindicated",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950",
    borderColor: "border-red-300 dark:border-red-800",
    icon: ShieldX,
    badgeVariant: "destructive",
    known: true,
  },
  severe: {
    label: "Severe",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    borderColor: "border-red-200 dark:border-red-900",
    icon: ShieldAlert,
    badgeVariant: "destructive",
    known: true,
  },
  moderate: {
    label: "Moderate",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    borderColor: "border-orange-200 dark:border-orange-900",
    icon: ShieldAlert,
    badgeVariant: "default",
    known: true,
  },
  mild: {
    label: "Mild",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
    borderColor: "border-yellow-200 dark:border-yellow-900",
    icon: ShieldCheck,
    badgeVariant: "secondary",
    known: true,
  },
};

/**
 * What we show when the stored severity is not one we recognise.
 *
 * `severity` is a free-text column (`prisma/schema.prisma`), so a capitalised
 * "Severe", a "major" from an imported corpus, or a value added by a future
 * migration can all reach this component. The previous fallback was
 * `SEVERITY_CONFIG.mild` — an unrecognised row rendered as a green shield
 * reading "Mild", which is a stated all-clear for a risk nobody has assessed.
 *
 * This is the same rule the rest of the product already follows: only a
 * `known` result may be presented as a degree. An unknown one says it is
 * unknown. The slate treatment is deliberately unlike all four known levels,
 * so it reads as "off the scale" rather than as a fifth point on it.
 */
export const UNKNOWN_SEVERITY: SeverityPresentation = {
  label: "Unknown severity",
  color: "text-slate-700 dark:text-slate-300",
  bgColor: "bg-slate-100 dark:bg-slate-900",
  borderColor: "border-slate-400 dark:border-slate-600",
  icon: ShieldQuestion,
  badgeVariant: "outline",
  known: false,
};

/**
 * Resolve a stored severity to its presentation.
 *
 * Case and surrounding whitespace are normalised first, because "Severe" is a
 * recognised severity written differently — not an unknown one. Anything that
 * still does not match falls to {@link UNKNOWN_SEVERITY}.
 */
export function severityPresentation(severity: string): SeverityPresentation {
  const normalised = severity?.trim().toLowerCase() ?? "";
  return SEVERITY_CONFIG[normalised] ?? UNKNOWN_SEVERITY;
}

/** Evidence level labels */
export const EVIDENCE_LABELS: Record<string, string> = {
  established: "Established",
  theoretical: "Theoretical",
  case_report: "Case Report",
};
