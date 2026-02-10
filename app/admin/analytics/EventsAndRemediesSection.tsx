import type { Analytics } from "./analytics.types";

export function EventsAndRemediesSection({
  events,
  remedies,
}: {
  events: Analytics["events"];
  remedies: Analytics["remedies"];
}) {
  const maxEventCount =
    events.length > 0 ? Math.max(...events.map((e) => e.count)) : 1;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">
          Events by Type (Last 7 Days)
        </h3>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-muted-foreground">No event data</p>
          ) : (
            events.map((event) => (
              <div
                key={event.type}
                className="flex items-center justify-between"
              >
                <span className="text-foreground capitalize">
                  {event.type.replace(/_/g, " ")}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (event.count / maxEventCount) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {event.count}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Remedies */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">
          Most Favorited Remedies
        </h3>
        <div className="space-y-3">
          {remedies.topViewed.length === 0 ? (
            <p className="text-muted-foreground">No favorite data</p>
          ) : (
            remedies.topViewed.map((remedy, i) => (
              <div
                key={remedy.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono text-sm w-6">
                    {i + 1}.
                  </span>
                  <span className="text-foreground">{remedy.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {remedy.count} favorites
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
