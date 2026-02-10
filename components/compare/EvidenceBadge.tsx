import React from "react";
import { EVIDENCE_LEVEL_CONFIG } from "./compare.types";

interface EvidenceBadgeProps {
  level: string | undefined;
}

/**
 * Evidence level badge component
 */
export const EvidenceBadge = React.memo(function EvidenceBadge({
  level,
}: EvidenceBadgeProps): React.ReactElement {
  if (!level) {
    return <span className="text-sm text-muted-foreground">Not specified</span>;
  }

  const config = EVIDENCE_LEVEL_CONFIG[level] || {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    description: "Unknown evidence level",
  };

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${config.color} ${config.bgColor}`}
      >
        {level}
      </span>
      <span className="text-xs text-muted-foreground">
        {config.description}
      </span>
    </div>
  );
});
