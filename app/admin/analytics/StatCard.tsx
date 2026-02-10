interface StatCardProps {
  label: string;
  value: number;
  highlight?: "green" | "blue" | "purple";
}

const highlightColors = {
  green: "text-green-600 dark:text-green-400",
  blue: "text-blue-600 dark:text-blue-400",
  purple: "text-purple-600 dark:text-purple-400",
};

export function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`text-2xl font-bold mt-1 ${
          highlight ? highlightColors[highlight] : "text-foreground"
        }`}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export function RateCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1 text-foreground">
        {value.toFixed(1)}%
      </p>
    </div>
  );
}
