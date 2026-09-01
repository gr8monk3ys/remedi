"use client";

import { memo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchTabsProps {
  activeTab: "results" | "history";
  setActiveTab: (tab: "results" | "history") => void;
  resultsCount: number;
  historyCount: number;
  showHistoryTab?: boolean;
  showFilters: boolean;
  toggleFilters: () => void;
  activeFiltersCount: number;
}

export const SearchTabs = memo(function SearchTabs({
  activeTab,
  setActiveTab,
  resultsCount,
  historyCount,
  showHistoryTab = true,
  showFilters,
  toggleFilters,
  activeFiltersCount,
}: SearchTabsProps) {
  return (
    <div className="mt-6 mb-4 flex items-end justify-between gap-4 border-b border-border">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "results" | "history")}
      >
        <TabsList className="border-b-0">
          <TabsTrigger value="results">
            Results
            {resultsCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5">
                {resultsCount}
              </Badge>
            )}
          </TabsTrigger>
          {showHistoryTab && (
            <TabsTrigger value="history">
              History
              {historyCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {historyCount}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {resultsCount > 0 && activeTab === "results" && (
        <Button
          data-filter-toggle
          variant={showFilters ? "tonal" : "ghost"}
          size="sm"
          onClick={toggleFilters}
          className="mb-1.5 gap-1.5"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="h-5 px-1.5">{activeFiltersCount}</Badge>
          )}
        </Button>
      )}
    </div>
  );
});
