import { ShieldCheck, FlaskConical, Leaf, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEvidenceMeta, UNCLASSIFIED_EVIDENCE } from "@/lib/evidence-levels";

interface EvidenceBadgeProps {
  /** Raw evidence level, e.g. "Strong", "Moderate", "Limited", "Traditional". */
  level?: string | null;
  className?: string;
  /** Show the plain-language explanation beneath the badge. */
  showDescription?: boolean;
}

/**
 * Icon per level. Colours and copy come from lib/evidence-levels so every
 * surface communicates evidence strength identically.
 */
const EVIDENCE_ICONS: Record<string, typeof ShieldCheck> = {
  "Strong evidence": ShieldCheck,
  "Moderate evidence": FlaskConical,
  "Limited evidence": FlaskConical,
  "Traditional use": Leaf,
};

/**
 * Maps a stored evidence level to a labelled, colour-coded badge with a plain
 * explanation. Surfacing this prominently lets users judge how well-supported a
 * remedy is rather than treating every suggestion as equally proven.
 */
export function EvidenceBadge({
  level,
  className,
  showDescription = false,
}: EvidenceBadgeProps) {
  const meta = getEvidenceMeta(level);

  if (!meta) {
    return null;
  }

  const Icon = EVIDENCE_ICONS[meta.label] ?? HelpCircle;

  // For a level we don't recognise, show what the data actually says rather
  // than a generic "Unclassified" — the raw value is more informative.
  const isRecognised = meta !== UNCLASSIFIED_EVIDENCE;
  const displayLabel = isRecognised ? meta.label : (level as string);

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        meta.badgeClassName,
        className,
      )}
      title={meta.description}
      aria-label={`Evidence level: ${displayLabel}. ${meta.description}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {displayLabel}
    </span>
  );

  if (!showDescription) {
    return badge;
  }

  return (
    <span className="flex flex-col gap-1">
      {badge}
      <span className="text-xs text-muted-foreground">{meta.description}</span>
    </span>
  );
}
