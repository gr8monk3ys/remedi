"use client";

import React, { memo } from "react";
import { SlidersHorizontal } from "lucide-react";

interface SearchTabsProps {
  activeTab: "results" | "history";
  setActiveTab: (tab: "results" | "history") => void;
  resultsCount: number;
  historyCount: number;
  showFilters: boolean;
  toggleFilters: () => void;
  activeFiltersCount: number;
}

export const SearchTabs = memo(function SearchTabs({
  activeTab,
  setActiveTab,
  resultsCount,
  historyCount,
  showFilters,
  toggleFilters,
  activeFiltersCount,
}: SearchTabsProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mt-6 mb-4">
      <button
        onClick={() => setActiveTab("results")}
        className={`py-2 px-4 font-medium text-sm ${
          activeTab === "results"
            ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        }`}
      >
        Results {resultsCount > 0 && `(${resultsCount})`}
      </button>
      <button
        onClick={() => setActiveTab("history")}
        className={`py-2 px-4 font-medium text-sm ${
          activeTab === "history"
            ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        }`}
      >
        History {historyCount > 0 && `(${historyCount})`}
      </button>

      {resultsCount > 0 && activeTab === "results" && (
        <button
          data-filter-toggle
          onClick={toggleFilters}
          className={`ml-auto py-2 px-4 font-medium text-sm flex items-center ${
            showFilters
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <SlidersHorizontal size={14} className="mr-1" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
      )}
    </div>
  );
});
