import { formatNumber } from "@/lib/utils";
export function CohortHeatCell({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const opacity = clamped / 100;
  return (
    <div
      className="px-2 py-1 rounded-md text-xs font-semibold text-foreground"
      style={{
        backgroundColor: `rgba(59, 130, 246, ${0.15 + opacity * 0.75})`,
      }}
    >
      {formatNumber(percent, 1)}%
    </div>
  );
}
