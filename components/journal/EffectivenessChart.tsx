"use client";

/**
 * Lightweight effectiveness chart using CSS-only rendering.
 * No heavy chart library required.
 */

interface DataPoint {
  date: string;
  rating: number;
  mood: number | null;
  energyLevel: number | null;
  sleepQuality: number | null;
}

interface EffectivenessChartProps {
  data: DataPoint[];
}

export function EffectivenessChart({
  data,
}: EffectivenessChartProps): React.JSX.Element {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Not enough data to show a chart.
      </p>
    );
  }

  const maxPoints = 30;
  const points = data.slice(-maxPoints);
  const maxRating = 5;

  return (
    <div className="space-y-4">
      {/* Rating Chart */}
      <div>
        <h4 className="text-sm font-medium mb-2">Effectiveness Over Time</h4>
        <div className="flex items-end gap-1 h-32">
          {points.map((point, i) => {
            const height = (point.rating / maxRating) * 100;
            const colors = [
              "bg-red-400",
              "bg-orange-400",
              "bg-amber-400",
              "bg-lime-400",
              "bg-green-500",
            ];
            const color = colors[point.rating - 1] ?? "bg-muted";

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                <div
                  className={`w-full min-w-[4px] rounded-t ${color} transition-all hover:opacity-80`}
                  style={{ height: `${height}%` }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                  <div className="bg-card border rounded-lg shadow-lg p-2 text-xs whitespace-nowrap">
                    <p className="font-medium">{point.date}</p>
                    <p>Rating: {point.rating}/5</p>
                    {point.mood && <p>Mood: {point.mood}/5</p>}
                    {point.energyLevel && <p>Energy: {point.energyLevel}/5</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Date labels */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {points[0]?.date}
          </span>
          <span className="text-xs text-muted-foreground">
            {points[points.length - 1]?.date}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-400" />
          <span>1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-400" />
          <span>2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-400" />
          <span>3</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-lime-400" />
          <span>4</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>5</span>
        </div>
      </div>
    </div>
  );
}
