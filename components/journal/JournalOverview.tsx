"use client";

import Link from "next/link";
import { BookOpen, Plus, TrendingUp } from "lucide-react";
import { JournalEntryCard } from "./JournalEntryCard";
import { JournalEntryForm } from "./JournalEntryForm";
import { useState } from "react";

interface TrackedRemedy {
  remedyId: string;
  remedyName: string;
}

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

interface JournalOverviewProps {
  trackedRemedies: TrackedRemedy[];
  recentEntries: JournalEntry[];
  totalEntries: number;
}

export function JournalOverview({
  trackedRemedies,
  recentEntries,
  totalEntries,
}: JournalOverviewProps): React.JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState(recentEntries);

  function handleNewEntry(entry: Record<string, unknown>): void {
    const parsed: JournalEntry = {
      id: String(entry.id ?? ""),
      remedyId: String(entry.remedyId ?? ""),
      remedyName: String(entry.remedyName ?? ""),
      date: entry.date instanceof Date ? entry.date : new Date(),
      rating: Number(entry.rating ?? 0),
      symptoms: Array.isArray(entry.symptoms) ? entry.symptoms : [],
      sideEffects: Array.isArray(entry.sideEffects) ? entry.sideEffects : [],
      dosageTaken:
        typeof entry.dosageTaken === "string" ? entry.dosageTaken : null,
      notes: typeof entry.notes === "string" ? entry.notes : null,
      mood: typeof entry.mood === "number" ? entry.mood : null,
      energyLevel:
        typeof entry.energyLevel === "number" ? entry.energyLevel : null,
      sleepQuality:
        typeof entry.sleepQuality === "number" ? entry.sleepQuality : null,
    };
    setEntries([parsed, ...entries]);
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">Total Entries</span>
          </div>
          <p className="text-2xl font-bold">{totalEntries}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Remedies Tracked</span>
          </div>
          <p className="text-2xl font-bold">{trackedRemedies.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full h-full flex items-center justify-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Entry</span>
          </button>
        </div>
      </div>

      {/* Tracked Remedies */}
      {trackedRemedies.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Tracked Remedies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {trackedRemedies.map((remedy) => (
              <Link
                key={remedy.remedyId}
                href={`/dashboard/journal/${remedy.remedyId}`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-sm truncate">
                  {remedy.remedyName}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No journal entries yet. Start tracking your remedies to see patterns
            over time.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* New Entry Form */}
      {showForm && (
        <JournalEntryForm
          onSubmit={handleNewEntry}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
