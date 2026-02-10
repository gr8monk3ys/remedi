import type { Analytics } from "./analytics.types";
import { StatCard } from "./StatCard";

export function SearchMetricsSection({
  searches,
}: {
  searches: Analytics["searches"];
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Search Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Searches" value={searches.total} />
        <StatCard
          label="Searches (24h)"
          value={searches.day}
          highlight="purple"
        />
        <StatCard label="Searches (7d)" value={searches.week} />
      </div>

      {/* Top Searches */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">
          Top Searches (Last 7 Days)
        </h3>
        <div className="space-y-3">
          {searches.top.length === 0 ? (
            <p className="text-muted-foreground">No search data</p>
          ) : (
            searches.top.map((search, i) => (
              <div
                key={search.query}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono text-sm w-6">
                    {i + 1}.
                  </span>
                  <span className="text-foreground">{search.query}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {search.count} searches
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
