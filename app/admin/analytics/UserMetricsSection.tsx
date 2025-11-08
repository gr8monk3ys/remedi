import type { Analytics } from "./analytics.types";
import { StatCard } from "./StatCard";

export function UserMetricsSection({ users }: { users: Analytics["users"] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        User Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={users.total} />
        <StatCard label="New (24h)" value={users.newDay} highlight="green" />
        <StatCard label="New (7d)" value={users.newWeek} />
        <StatCard label="New (30d)" value={users.newMonth} />
        <StatCard
          label="Active (24h)"
          value={users.activeDay}
          highlight="blue"
        />
        <StatCard label="Active (7d)" value={users.activeWeek} />
      </div>
    </section>
  );
}
