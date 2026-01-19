"use client";

import { Sparkles } from "lucide-react";
import type { AIInsights } from "./types";

interface AIInsightsPanelProps {
  insights: AIInsights;
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  if (!insights) return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
        <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Insights</h3>
      </div>

      {insights.intent && (
        <div className="mb-2">
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Intent:{" "}
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{insights.intent}</span>
        </div>
      )}

      {insights.extractedInfo?.symptoms && insights.extractedInfo.symptoms.length > 0 && (
        <div className="mb-2">
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Detected Symptoms:{" "}
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {insights.extractedInfo.symptoms.join(", ")}
          </span>
        </div>
      )}

      {insights.extractedInfo?.pharmaceutical && (
        <div className="mb-2">
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Pharmaceutical Mentioned:{" "}
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {insights.extractedInfo.pharmaceutical}
          </span>
        </div>
      )}
    </div>
  );
}
