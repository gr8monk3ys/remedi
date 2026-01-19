"use client";

import React, { memo } from "react";
import type { SearchHistoryItem } from "./types";

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
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Recent Searches
        </h3>
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Recent Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectQuery(item.query)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full text-sm"
          >
            {item.query}
            {item.resultsCount > 0 && (
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
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
            console.error("Failed to clear history:", error);
          }
        }}
        disabled={isLoading}
        className="mt-2 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Clear History
      </button>
    </div>
  );
});
