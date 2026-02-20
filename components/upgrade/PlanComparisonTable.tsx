"use client";

/**
 * Plan Comparison Table
 *
 * Displays a feature comparison across Free, Basic, and Premium plans.
 * Used inside the UpgradeModal.
 */

import {
  Search,
  Heart,
  Sparkles,
  BarChart3,
  Download,
  Clock,
} from "lucide-react";
import { PLAN_COMPARISON } from "./upgrade-modal.constants";

const featureIcons: Record<string, React.ReactNode> = {
  searches: <Search className="w-5 h-5" />,
  favorites: <Heart className="w-5 h-5" />,
  aiSearches: <Sparkles className="w-5 h-5" />,
  compare: <BarChart3 className="w-5 h-5" />,
  export: <Download className="w-5 h-5" />,
  history: <Clock className="w-5 h-5" />,
};

function CellValue({ value }: { value: string }) {
  if (value === "-") {
    return <span className="text-muted-foreground/40">-</span>;
  }
  return <>{value}</>;
}

export function PlanComparisonTable() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Compare Plans
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                Feature
              </th>
              <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                Free
              </th>
              <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                Basic
              </th>
              <th className="text-center py-3 px-2 font-medium text-primary">
                Premium
              </th>
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON.map((row) => (
              <tr key={row.feature} className="border-b border-border">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {featureIcons[row.icon]}
                    </span>
                    <span className="text-foreground">{row.feature}</span>
                  </div>
                </td>
                <td className="text-center py-3 px-2 text-muted-foreground">
                  <CellValue value={row.free} />
                </td>
                <td className="text-center py-3 px-2 text-foreground">
                  <CellValue value={row.basic} />
                </td>
                <td className="text-center py-3 px-2 font-medium text-primary">
                  <CellValue value={row.premium} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
