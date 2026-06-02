import { ShieldCheck, FlaskConical, Leaf, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceBadgeProps {
  /** Raw evidence level, e.g. "Strong", "Moderate", "Limited", "Traditional". */
  level?: string | null;
  className?: string;
}

type EvidenceMeta = {
  label: string;
  description: string;
  icon: typeof ShieldCheck;
  className: string;
};

/**
 * Maps a stored evidence level to a labelled, colour-coded badge with a plain
 * explanation. Surfacing this prominently lets users judge how well-supported a
 * remedy is rather than treating every suggestion as equally proven.
 */
const EVIDENCE_META: Record<string, EvidenceMeta> = {
  strong: {
    label: "Strong evidence",
    description:
      "Supported by multiple high-quality human studies or systematic reviews.",
    icon: ShieldCheck,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  },
  moderate: {
    label: "Moderate evidence",
    description:
      "Some supporting human studies, but more research is needed to confirm.",
    icon: FlaskConical,
    className:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  },
  limited: {
    label: "Limited evidence",
    description:
      "Preliminary or limited evidence only — interpret with caution.",
    icon: FlaskConical,
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  },
  traditional: {
    label: "Traditional use",
    description:
      "Based on traditional or historical use rather than clinical trials.",
    icon: Leaf,
    className:
      "border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300",
  },
};

export function EvidenceBadge({ level, className }: EvidenceBadgeProps) {
  if (!level || level.trim() === "") {
    return null;
  }

  const meta = EVIDENCE_META[level.trim().toLowerCase()] ?? {
    label: level,
    description:
      "Evidence strength for this remedy has not been classified. Talk to a healthcare professional before relying on it.",
    icon: HelpCircle,
    className:
      "border-border bg-muted text-muted-foreground dark:border-border",
  };

  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        meta.className,
        className,
      )}
      title={meta.description}
      aria-label={`Evidence level: ${meta.label}. ${meta.description}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
