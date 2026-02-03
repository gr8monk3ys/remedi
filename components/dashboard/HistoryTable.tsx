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
        <ChevronDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
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
        <Search className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          No search history yet
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
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
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
              Search Query
            </th>
            <th
              className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 cursor-pointer group"
              onClick={() => handleSort("results")}
            >
              <span className="flex items-center gap-1">
                Results
                <SortIcon column="results" />
              </span>
            </th>
            <th
              className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 cursor-pointer group"
              onClick={() => handleSort("date")}
            >
              <span className="flex items-center gap-1">
                Date
                <SortIcon column="date" />
              </span>
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                    {item.query}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                {item.resultsCount}{" "}
                {item.resultsCount === 1 ? "result" : "results"}
              </td>
              <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                <time dateTime={item.createdAt.toISOString()}>
                  {format(item.createdAt, "MMM d, yyyy h:mm a")}
                </time>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  {onRerun && (
                    <button
                      onClick={() => onRerun(item.query)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-primary"
                      aria-label={`Re-run search for "${item.query}"`}
                      title="Re-run search"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500"
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
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </th>
            <th className="text-left py-3 px-4">
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </th>
            <th className="text-left py-3 px-4">
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </th>
            <th className="text-right py-3 px-4">
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr
              key={i}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <td className="py-3 px-4">
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </td>
              <td className="py-3 px-4">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </td>
              <td className="py-3 px-4">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </td>
              <td className="py-3 px-4">
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
