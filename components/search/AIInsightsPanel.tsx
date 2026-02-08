"use client";

import { Sparkles } from "lucide-react";
import type { AIInsights } from "./types";

interface AIInsightsPanelProps {
  insights: AIInsights;
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  if (!insights) return null;

  return (
    <div
      className="neu-card-flat mb-6 p-4"
      style={{
        background:
          "color-mix(in srgb, var(--primary-surface) 50%, var(--surface))",
        border: "1px solid var(--primary-surface)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} style={{ color: "var(--primary)" }} />
        <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
          AI Insights
        </h3>
      </div>

      {insights.intent && (
        <div className="mb-2">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--primary-dark)" }}
          >
            Intent:{" "}
          </span>
          <span
            className="text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            {insights.intent}
          </span>
        </div>
      )}

      {insights.extractedInfo?.symptoms &&
        insights.extractedInfo.symptoms.length > 0 && (
          <div className="mb-2">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--primary-dark)" }}
            >
              Detected Symptoms:{" "}
            </span>
            <span
              className="text-sm"
              style={{ color: "var(--foreground-muted)" }}
            >
              {insights.extractedInfo.symptoms.join(", ")}
            </span>
          </div>
        )}

      {insights.extractedInfo?.pharmaceutical && (
        <div className="mb-2">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--primary-dark)" }}
          >
            Pharmaceutical Mentioned:{" "}
          </span>
          <span
            className="text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            {insights.extractedInfo.pharmaceutical}
          </span>
        </div>
      )}
    </div>
  );
}
