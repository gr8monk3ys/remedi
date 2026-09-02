"use client";

import { Sparkles } from "lucide-react";
import type { AIInsights } from "./types";

interface AIInsightsPanelProps {
  insights: AIInsights;
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  if (!insights) return null;

  const symptoms = insights.extractedInfo?.symptoms ?? [];

  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold">AI Insights</h3>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
        {insights.intent && (
          <>
            <dt className="eyebrow eyebrow-muted pt-0.5">Intent:</dt>
            <dd className="text-foreground">{insights.intent}</dd>
          </>
        )}

        {symptoms.length > 0 && (
          <>
            <dt className="eyebrow eyebrow-muted pt-0.5">Detected Symptoms:</dt>
            <dd className="text-foreground">{symptoms.join(", ")}</dd>
          </>
        )}

        {insights.extractedInfo?.pharmaceutical && (
          <>
            <dt className="eyebrow eyebrow-muted pt-0.5">
              Pharmaceutical Mentioned:
            </dt>
            <dd className="text-foreground">
              {insights.extractedInfo.pharmaceutical}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
