/**
 * What a Replacement Type is allowed to claim, in one place.
 *
 * A Replacement Type is the claim-limiting label on a Remedy Mapping:
 * Alternative, Complementary or Supportive. It is the single most important
 * thing on a search result, because without it a merely Supportive suggestion
 * reads as a candidate substitute for someone's prescription.
 *
 * The copy used to live as a private constant inside SearchResultCard, which
 * is why /compare could render a score with no label at all and nobody
 * noticed. It is a module now because two surfaces render it, and a third
 * (the remedy detail page) should.
 */

import type { ReplacementType } from "@/lib/types";

export interface ReplacementTypeMeta {
  label: ReplacementType;
  /** Plain-language meaning. Must reach the user, not only a mouse tooltip. */
  description: string;
  badgeClassName: string;
}

export const REPLACEMENT_TYPE_META: Record<
  ReplacementType,
  ReplacementTypeMeta
> = {
  Alternative: {
    label: "Alternative",
    description:
      "May serve a similar purpose. Never stop a prescribed medication without talking to your provider.",
    badgeClassName:
      "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  },
  Complementary: {
    label: "Complementary",
    description: "Sometimes used alongside conventional treatment.",
    badgeClassName:
      "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200",
  },
  Supportive: {
    label: "Supportive",
    description:
      "General supportive use only — not a substitute for this medication.",
    badgeClassName:
      "border-slate-300 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
  },
};

/**
 * Resolve a stored value to its meta.
 *
 * Returns `null` rather than guessing. A caller that gets `null` must not
 * render a relevance score either — an unlabelled score is the presentation
 * this vocabulary exists to prevent.
 */
export function replacementTypeMeta(
  value: string | null | undefined,
): ReplacementTypeMeta | null {
  if (!value) return null;
  return REPLACEMENT_TYPE_META[value as ReplacementType] ?? null;
}
