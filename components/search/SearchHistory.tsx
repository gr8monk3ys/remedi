"use client";

import { memo } from "react";
import { Loader2 } from "lucide-react";
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
        <h3 className="eyebrow eyebrow-muted mb-3">Recent Searches</h3>
        <div className="flex items-center justify-center py-4">
          <Loader2
            className="h-5 w-5 animate-spin text-muted-foreground"
            aria-label="Loading search history"
          />
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="eyebrow eyebrow-muted">Recent Searches</h3>
        <button
          type="button"
          onClick={async () => {
            try {
              await onClearHistory();
            } catch (error) {
              logger.error("Failed to clear history", error);
            }
          }}
          disabled={isLoading}
          className="text-xs text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear History
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectQuery(item.query)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-foreground transition-colors hover:border-border-strong hover:bg-muted"
          >
            {item.query}
            {item.resultsCount > 0 && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {item.resultsCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});
