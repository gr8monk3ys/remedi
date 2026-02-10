"use client";

import { memo } from "react";
import type { SearchHistoryItem } from "./types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("search-history");

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  isLoading: boolean;
  onSelectQuery: (query: string) => void;
  onClearHistory: () => Promise<void>;
}

export const SearchHistory = memo(function SearchHistory({
  history,
  isLoading,
  onSelectQuery,
  onClearHistory,
}: SearchHistoryProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <h3
          className="text-sm font-medium mb-2"
          style={{ color: "var(--foreground-muted)" }}
        >
          Recent Searches
        </h3>
        <div className="flex justify-center items-center py-4">
          <div
            className="animate-spin rounded-full h-6 w-6 border-b-2"
            style={{ borderColor: "var(--primary)" }}
          ></div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3
        className="text-sm font-medium mb-2"
        style={{ color: "var(--foreground-muted)" }}
      >
        Recent Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectQuery(item.query)}
            className="neu-pill px-3 py-1 rounded-full text-sm transition-all"
            style={{ color: "var(--foreground)" }}
          >
            {item.query}
            {item.resultsCount > 0 && (
              <span
                className="ml-1 text-xs"
                style={{ color: "var(--foreground-subtle)" }}
              >
                ({item.resultsCount})
              </span>
            )}
          </button>
        ))}
      </div>
      <button
        onClick={async () => {
          try {
            await onClearHistory();
          } catch (error) {
            logger.error("Failed to clear history", error);
          }
        }}
        disabled={isLoading}
        className="mt-2 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ color: "var(--error)" }}
      >
        Clear History
      </button>
    </div>
  );
});
