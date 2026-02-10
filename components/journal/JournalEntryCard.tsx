"use client";

import { Star, Zap, Moon, Smile } from "lucide-react";

interface JournalEntry {
  id: string;
  remedyId: string;
  remedyName: string;
  date: Date;
  rating: number;
  symptoms: string[];
  sideEffects: string[];
  dosageTaken: string | null;
  notes: string | null;
  mood: number | null;
  energyLevel: number | null;
  sleepQuality: number | null;
}

interface JournalEntryCardProps {
  entry: JournalEntry;
}

function RatingStars({ rating }: { rating: number }): React.JSX.Element {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function ScaleIndicator({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Smile;
  label: string;
  value: number;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="w-3.5 h-3.5" />
      <span>
        {label}: {value}/5
      </span>
    </div>
  );
}

export function JournalEntryCard({
  entry,
}: JournalEntryCardProps): React.JSX.Element {
  const dateStr = new Date(entry.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-4 rounded-lg border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-medium truncate">{entry.remedyName}</span>
            <RatingStars rating={entry.rating} />
          </div>
          <p className="text-xs text-muted-foreground">{dateStr}</p>
        </div>
        {entry.dosageTaken && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
            {entry.dosageTaken}
          </span>
        )}
      </div>

      {/* Symptoms & Side Effects */}
      {(entry.symptoms.length > 0 || entry.sideEffects.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {entry.symptoms.map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            >
              {s}
            </span>
          ))}
          {entry.sideEffects.map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Wellbeing Indicators */}
      {(entry.mood || entry.energyLevel || entry.sleepQuality) && (
        <div className="flex gap-4 mt-2">
          {entry.mood && (
            <ScaleIndicator icon={Smile} label="Mood" value={entry.mood} />
          )}
          {entry.energyLevel && (
            <ScaleIndicator
              icon={Zap}
              label="Energy"
              value={entry.energyLevel}
            />
          )}
          {entry.sleepQuality && (
            <ScaleIndicator
              icon={Moon}
              label="Sleep"
              value={entry.sleepQuality}
            />
          )}
        </div>
      )}

      {entry.notes && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {entry.notes}
        </p>
      )}
    </div>
  );
}
