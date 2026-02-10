import React from "react";
import type { CompareRemedy } from "./compare.types";

interface ComparisonRowProps {
  label: string;
  remedies: CompareRemedy[];
  renderCell: (remedy: CompareRemedy) => React.ReactNode;
  highlight?: boolean;
}

/**
 * Comparison row for an attribute
 */
export const ComparisonRow = React.memo(function ComparisonRow({
  label,
  remedies,
  renderCell,
  highlight = false,
}: ComparisonRowProps): React.ReactElement {
  return (
    <div
      className={`grid gap-4 py-4 px-4 ${highlight ? "bg-primary/5" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${remedies.length}, minmax(0, 1fr))`,
      }}
      role="row"
      aria-label={label}
    >
      {remedies.map((remedy) => (
        <div key={remedy.id} className="min-w-0" role="cell">
          {renderCell(remedy)}
        </div>
      ))}
    </div>
  );
});
