import { cn } from "@/lib/utils";
import { replacementTypeMeta } from "@/lib/replacement-type";

interface ReplacementTypeBadgeProps {
  /** Raw replacement type, e.g. "Alternative", "Complementary", "Supportive". */
  type?: string | null;
  className?: string;
}

/**
 * The claim-limiting label on a Remedy Mapping.
 *
 * The meaning is carried in `aria-label` as well as `title`. It used to be
 * `title`-only, which does not appear on touch, is not reachable by keyboard
 * and is announced inconsistently — so the sentence that turns "Supportive"
 * into "not a substitute for this medication" was mouse-only. EvidenceBadge
 * already did this correctly; this follows it.
 */
export function ReplacementTypeBadge({
  type,
  className,
}: ReplacementTypeBadgeProps) {
  const meta = replacementTypeMeta(type);

  if (!meta) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        meta.badgeClassName,
        className,
      )}
      title={meta.description}
      aria-label={`Relationship to the medication: ${meta.label}. ${meta.description}`}
    >
      {meta.label}
    </span>
  );
}
