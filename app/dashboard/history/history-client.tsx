"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, AlertCircle } from "lucide-react";
import { HistoryTable } from "@/components/dashboard/HistoryTable";
import type { SearchHistoryItem, HistorySortOption } from "@/types/dashboard";

interface HistoryPageClientProps {
  history: SearchHistoryItem[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  currentSort: string;
  userId: string;
}

/**
 * History Page Client Component
 *
 * Handles client-side interactions for the history page.
 */
export function HistoryPageClient({
  history,
  currentPage,
  totalPages,
  totalCount,
  currentSort,
  userId,
}: HistoryPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSortChange = (sort: HistorySortOption): void => {
    startTransition(() => {
      router.push(`/dashboard/history?page=1&sort=${sort}`);
    });
  };

  const handlePageChange = (newPage: number): void => {
    startTransition(() => {
      router.push(`/dashboard/history?page=${newPage}&sort=${currentSort}`);
    });
  };

  const handleRerun = (query: string): void => {
    router.push(`/?q=${encodeURIComponent(query)}`);
  };

  const handleExport = async (format: "csv" | "json"): Promise<void> => {
    try {
      const response = await fetch(
        `/api/dashboard/history/export?format=${format}`,
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `search-history.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError("Failed to export history. Please try again.");
    }
  };

  const handleClearHistory = async (): Promise<void> => {
    setIsClearing(true);
    setError(null);

    try {
      const response = await fetch(`/api/search-history?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear history");
      }

      setShowClearConfirm(false);
      router.refresh();
    } catch {
      setError("Failed to clear history. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "search" : "searches"} in history
        </p>

        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              disabled={totalCount === 0}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-card rounded-lg shadow-lg border border-border py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport("csv")}
                className="block w-full px-4 py-2 text-sm text-left text-foreground hover:bg-muted"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport("json")}
                className="block w-full px-4 py-2 text-sm text-left text-foreground hover:bg-muted"
              >
                Export as JSON
              </button>
            </div>
          </div>

          {/* Clear History Button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-card border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            disabled={totalCount === 0}
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Clear Search History?
            </h3>
            <p className="text-muted-foreground mb-4">
              This will permanently delete all {totalCount} searches from your
              history. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                disabled={isClearing}
              >
                {isClearing ? "Clearing..." : "Clear History"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <HistoryTable
          history={history}
          onRerun={handleRerun}
          sortOption={currentSort as HistorySortOption}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
