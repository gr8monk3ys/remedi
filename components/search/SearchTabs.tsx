"use client";

import { memo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <div className="mt-6 mb-4 flex items-center justify-between">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "results" | "history")}
      >
        <TabsList>
          <TabsTrigger value="results">
            Results{" "}
            {resultsCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                {resultsCount}
              </Badge>
            )}
          </TabsTrigger>
          {showHistoryTab && (
            <TabsTrigger value="history">
              History{" "}
              {historyCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 px-1.5 text-xs"
                >
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
          variant={showFilters ? "secondary" : "ghost"}
          size="sm"
          onClick={toggleFilters}
          className={cn("gap-1.5", showFilters && "bg-secondary")}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="h-5 px-1.5 text-xs">{activeFiltersCount}</Badge>
          )}
        </Button>
      )}
    </div>
  );
});
