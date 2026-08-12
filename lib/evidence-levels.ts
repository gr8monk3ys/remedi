/**
 * Evidence level presentation — the single source of truth.
 *
 * How strongly a remedy is supported is the core signal this product
 * communicates, so it must look the same everywhere. Previously the badge on a
 * remedy page, the compare table, the mobile swiper, AI reports and the about
 * page each carried their own palette, and "Moderate" rendered in the colour
 * another screen used for "Limited". Every surface now reads from here.
 *
 * Lookups are case-insensitive: stored values are TitleCase ("Strong") but
 * user-contributed and AI-generated values are not guaranteed to be.
 */

export type EvidenceLevelKey =
  | "strong"
  | "moderate"
  | "limited"
  | "traditional";

export interface EvidenceLevelMeta {
  /** Human label, e.g. "Strong evidence". */
  label: string;
  /** Short label for dense surfaces (tables, swipers). */
  shortLabel: string;
  /** Plain-language explanation, used as tooltip and accessible description. */
  description: string;
  /** Tailwind classes for a bordered badge (border + background + text). */
  badgeClassName: string;
  /** Text colour only, for compact surfaces. */
  textClassName: string;
  /** Background colour only, for compact surfaces. */
  bgClassName: string;
}

export const EVIDENCE_LEVELS: Record<EvidenceLevelKey, EvidenceLevelMeta> = {
  strong: {
    label: "Strong evidence",
    shortLabel: "Strong",
    description:
      "Supported by multiple high-quality human studies or systematic reviews.",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    textClassName: "text-emerald-700 dark:text-emerald-300",
    bgClassName: "bg-emerald-50 dark:bg-emerald-950",
  },
  moderate: {
    label: "Moderate evidence",
    shortLabel: "Moderate",
    description:
      "Some supporting human studies, but more research is needed to confirm.",
    badgeClassName:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
    textClassName: "text-sky-700 dark:text-sky-300",
    bgClassName: "bg-sky-50 dark:bg-sky-950",
  },
  limited: {
    label: "Limited evidence",
    shortLabel: "Limited",
    description:
      "Preliminary or limited evidence only — interpret with caution.",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    textClassName: "text-amber-800 dark:text-amber-300",
    bgClassName: "bg-amber-50 dark:bg-amber-950",
  },
  traditional: {
    label: "Traditional use",
    shortLabel: "Traditional",
    description:
      "Based on traditional or historical use rather than clinical trials.",
    badgeClassName:
      "border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300",
    textClassName: "text-stone-700 dark:text-stone-300",
    bgClassName: "bg-stone-50 dark:bg-stone-900",
  },
};

/** Presentation for a level that is missing or not recognised. */
export const UNCLASSIFIED_EVIDENCE: EvidenceLevelMeta = {
  label: "Unclassified",
  shortLabel: "Unclassified",
  description:
    "Evidence strength for this remedy has not been classified. Talk to a healthcare professional before relying on it.",
  badgeClassName: "border-border bg-muted text-muted-foreground",
  textClassName: "text-muted-foreground",
  bgClassName: "bg-muted",
};

/**
 * Resolve a stored evidence level to its presentation, case-insensitively.
 * Returns null for an absent level so callers can choose to render nothing.
 */
export function getEvidenceMeta(
  level?: string | null,
): EvidenceLevelMeta | null {
  if (!level || level.trim() === "") {
    return null;
  }

  const key = level.trim().toLowerCase();
  return EVIDENCE_LEVELS[key as EvidenceLevelKey] ?? UNCLASSIFIED_EVIDENCE;
}
