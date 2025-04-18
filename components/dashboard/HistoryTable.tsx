"use client";

import Link from "next/link";
import {
  Search,
  RotateCcw,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { SearchHistoryItem, HistorySortOption } from "@/types/dashboard";

interface HistoryTableProps {
  history: SearchHistoryItem[];
  onRerun?: (query: string) => void;
  onDelete?: (id: string) => void;
  sortOption?: HistorySortOption;
  onSortChange?: (sort: HistorySortOption) => void;
  className?: string;
}

/**
 * History Table Component
 *
 * Displays search history in a sortable table.
 */
export function HistoryTable({
  history,
  onRerun,
  onDelete,
  sortOption = "newest",
  onSortChange,
  className,
}: HistoryTableProps) {
  const handleSort = (column: "date" | "results"): void => {
    if (!onSortChange) return;

    if (column === "date") {
      onSortChange(sortOption === "newest" ? "oldest" : "newest");
    } else {
      onSortChange(
        sortOption === "most_results" ? "least_results" : "most_results",
      );
    }
  };

  const SortIcon = ({ column }: { column: "date" | "results" }) => {
    const isDateColumn = column === "date";
    const isResultsColumn = column === "results";

    const isActive =
      (isDateColumn && (sortOption === "newest" || sortOption === "oldest")) ||
      (isResultsColumn &&
        (sortOption === "most_results" || sortOption === "least_results"));

    const isAscending =
      sortOption === "oldest" || sortOption === "least_results";

    if (!isActive) {
      return (
        <ChevronDown className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
      );
    }

    return isAscending ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  if (history.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No search history yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start searching to build your history
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Search className="h-4 w-4" />
          Start Searching
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
              Search Query
            </th>
            <th
              className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer group"
              onClick={() => handleSort("results")}
            >
              <span className="flex items-center gap-1">
                Results
                <SortIcon column="results" />
              </span>
            </th>
            <th
              className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer group"
              onClick={() => handleSort("date")}
            >
              <span className="flex items-center gap-1">
                Date
                <SortIcon column="date" />
              </span>
            </th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id} className="border-b border-border hover:bg-muted">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-foreground truncate max-w-xs">
                    {item.query}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {item.resultsCount}{" "}
                {item.resultsCount === 1 ? "result" : "results"}
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                <time dateTime={item.createdAt.toISOString()}>
                  {format(item.createdAt, "MMM d, yyyy h:mm a")}
                </time>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  {onRerun && (
                    <button
                      onClick={() => onRerun(item.query)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                      aria-label={`Re-run search for "${item.query}"`}
                      title="Re-run search"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500"
                      aria-label={`Delete search "${item.query}"`}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton loader for history table
 */
export function HistoryTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </th>
            <th className="text-left py-3 px-4">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </th>
            <th className="text-left py-3 px-4">
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </th>
            <th className="text-right py-3 px-4">
              <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-3 px-4">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              </td>
              <td className="py-3 px-4">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </td>
              <td className="py-3 px-4">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </td>
              <td className="py-3 px-4">
                <div className="h-8 w-16 bg-muted rounded animate-pulse ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
