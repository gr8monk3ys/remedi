import React from "react";
import { EvidenceBadge as SharedEvidenceBadge } from "@/components/remedy/EvidenceBadge";

interface EvidenceBadgeProps {
  level: string | undefined;
}

/**
 * Evidence badge for the comparison table.
 *
 * Delegates to the shared badge so compare, remedy pages, reports and the
 * mobile swiper all render the same colour for the same level. The compare
 * table shows the explanation inline, since users are weighing remedies
 * side by side and cannot hover every badge.
 */
export const EvidenceBadge = React.memo(function EvidenceBadge({
  level,
}: EvidenceBadgeProps): React.ReactElement {
  if (!level) {
    return <span className="text-sm text-muted-foreground">Not specified</span>;
  }

  return <SharedEvidenceBadge level={level} showDescription />;
});
