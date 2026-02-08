"use client";

import { memo } from "react";
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
    <div
      className="flex mt-6 mb-4"
      style={{ borderBottom: "1px solid var(--shadow-dark)" }}
    >
      <button
        onClick={() => setActiveTab("results")}
        className="py-2 px-4 font-medium text-sm transition-colors"
        style={{
          color:
            activeTab === "results"
              ? "var(--primary)"
              : "var(--foreground-muted)",
          borderBottom:
            activeTab === "results"
              ? "2px solid var(--primary)"
              : "2px solid transparent",
        }}
      >
        Results {resultsCount > 0 && `(${resultsCount})`}
      </button>
      <button
        onClick={() => setActiveTab("history")}
        className="py-2 px-4 font-medium text-sm transition-colors"
        style={{
          color:
            activeTab === "history"
              ? "var(--primary)"
              : "var(--foreground-muted)",
          borderBottom:
            activeTab === "history"
              ? "2px solid var(--primary)"
              : "2px solid transparent",
        }}
      >
        History {historyCount > 0 && `(${historyCount})`}
      </button>

      {resultsCount > 0 && activeTab === "results" && (
        <button
          data-filter-toggle
          onClick={toggleFilters}
          className="ml-auto py-2 px-4 font-medium text-sm flex items-center transition-colors"
          style={{
            color: showFilters ? "var(--primary)" : "var(--foreground-muted)",
          }}
        >
          <SlidersHorizontal size={14} className="mr-1" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
      )}
    </div>
  );
});
