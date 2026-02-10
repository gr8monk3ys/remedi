"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { EffectivenessChart } from "./EffectivenessChart";
import { JournalEntryCard } from "./JournalEntryCard";
import Link from "next/link";

interface Insights {
  remedyId: string;
  remedyName: string;
  totalEntries: number;
  avgRating: number;
  trend: "improving" | "declining" | "stable";
  topSymptoms: Array<{ symptom: string; count: number }>;
  topSideEffects: Array<{ effect: string; count: number }>;
  ratingHistory: Array<{
    date: string;
    rating: number;
    mood: number | null;
    energyLevel: number | null;
    sleepQuality: number | null;
  }>;
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

interface RemedyJournalDetailProps {
  insights: Insights;
  entries: JournalEntry[];
}

const TREND_CONFIG = {
  improving: {
    icon: TrendingUp,
    label: "Improving",
    color: "text-green-600 dark:text-green-400",
  },
  declining: {
    icon: TrendingDown,
    label: "Declining",
    color: "text-red-600 dark:text-red-400",
  },
  stable: {
    icon: Minus,
    label: "Stable",
    color: "text-muted-foreground",
  },
};

export function RemedyJournalDetail({
  insights,
  entries,
}: RemedyJournalDetailProps): React.JSX.Element {
  const trendInfo = TREND_CONFIG[insights.trend];
  const TrendIcon = trendInfo.icon;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/journal"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Journal
      </Link>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Rating</p>
          <p className="text-2xl font-bold">{insights.avgRating}/5</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Trend</p>
          <div className={`flex items-center gap-1 ${trendInfo.color}`}>
            <TrendIcon className="w-5 h-5" />
            <span className="text-lg font-bold">{trendInfo.label}</span>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Entries</p>
          <p className="text-2xl font-bold">{insights.totalEntries}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Top Symptom</p>
          <p className="text-lg font-bold truncate">
            {insights.topSymptoms[0]?.symptom ?? "None"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border bg-card p-6">
        <EffectivenessChart data={insights.ratingHistory} />
      </div>

      {/* Symptom & Side Effect Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.topSymptoms.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-sm font-semibold mb-3">
              Most Reported Symptoms
            </h3>
            <div className="space-y-2">
              {insights.topSymptoms.map(({ symptom, count }) => (
                <div key={symptom} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{symptom}</span>
                      <span className="text-muted-foreground">{count}x</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted mt-1">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${(count / insights.totalEntries) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.topSideEffects.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-sm font-semibold mb-3">
              Most Reported Side Effects
            </h3>
            <div className="space-y-2">
              {insights.topSideEffects.map(({ effect, count }) => (
                <div key={effect} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{effect}</span>
                      <span className="text-muted-foreground">{count}x</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted mt-1">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{
                          width: `${(count / insights.totalEntries) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entries List */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">All Entries</h3>
        <div className="space-y-3">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
