import { formatNumber } from "@/lib/utils";
interface StatCardProps {
  label: string;
  value: number;
  highlight?: "green" | "blue" | "purple";
}

const highlightColors = {
  green: "text-primary",
  blue: "text-info",
  purple: "text-premium",
};

export function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="eyebrow eyebrow-muted">{label}</p>
      <p
        className={`tabular mt-2 text-2xl font-semibold tracking-tight ${
          highlight ? highlightColors[highlight] : "text-foreground"
        }`}
      >
        {formatNumber(value)}
      </p>
    </div>
  );
}

export function RateCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="eyebrow eyebrow-muted">{label}</p>
      <p className="tabular mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {formatNumber(value, 1)}%
      </p>
    </div>
  );
}
