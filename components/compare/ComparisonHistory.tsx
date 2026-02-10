"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, ChevronRight, X } from "lucide-react";
import { createLogger } from "@/lib/logger";

const logger = createLogger("comparison-history");

/**
 * Comparison history entry type
 */
interface ComparisonEntry {
  id: string;
  timestamp: string;
  remedyIds: string[];
  remedyNames: string[];
}

/**
 * Props for ComparisonHistory component
 */
interface ComparisonHistoryProps {
  /** Maximum number of entries to display */
  maxEntries?: number;
  /** Additional CSS classes */
  className?: string;
}

const HISTORY_KEY = "remedi-comparison-history";

/**
 * Component to display and manage comparison history.
 *
 * Features:
 * - Shows recent comparisons stored in localStorage
 * - Quick access to previous comparisons
 * - Delete individual entries or clear all
 * - Responsive design with collapsible sections
 */
export function ComparisonHistory({
  maxEntries = 5,
  className = "",
}: ComparisonHistoryProps) {
  const [history, setHistory] = useState<ComparisonEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ComparisonEntry[];
        setHistory(parsed.slice(0, maxEntries));
      }
    } catch (error) {
      logger.error("Failed to load comparison history", error);
    } finally {
      setIsLoading(false);
    }
  }, [maxEntries]);

  /**
   * Delete a single history entry
   */
  const deleteEntry = (id: string) => {
    const newHistory = history.filter((entry) => entry.id !== id);
    setHistory(newHistory);

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      logger.error("Failed to update comparison history", error);
    }
  };

  /**
   * Clear all history
   */
  const clearAllHistory = () => {
    setHistory([]);

    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      logger.error("Failed to clear comparison history", error);
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Don't render if loading or no history
  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-muted rounded mb-3" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-card rounded-xl shadow-sm border border-border overflow-hidden ${className}`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium text-foreground">
            Recent Comparisons
          </span>
          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
            {history.length}
          </span>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-muted-foreground transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {/* History entries */}
              <ul className="divide-y divide-border">
                {history.map((entry) => (
                  <li key={entry.id} className="group relative">
                    <Link
                      href={`/compare?ids=${entry.remedyIds.join(",")}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-8">
                        <p className="text-sm font-medium text-foreground truncate">
                          {entry.remedyNames.join(" vs ")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimestamp(entry.timestamp)} -{" "}
                          {entry.remedyIds.length} remedies
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </Link>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteEntry(entry.id);
                      }}
                      className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label={`Delete comparison: ${entry.remedyNames.join(" vs ")}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* Clear all button */}
              <div className="px-4 py-3 border-t border-border bg-muted">
                <button
                  onClick={clearAllHistory}
                  className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook to access comparison history
 */
export function useComparisonHistory() {
  const [history, setHistory] = useState<ComparisonEntry[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (error) {
        logger.error("Failed to load comparison history", error);
      }
    };

    loadHistory();

    // Listen for storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === HISTORY_KEY) {
        loadHistory();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addToHistory = (remedyIds: string[], remedyNames: string[]) => {
    const entry: ComparisonEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      remedyIds,
      remedyNames,
    };

    const newHistory = [
      entry,
      ...history.filter(
        (h) => h.remedyIds.sort().join(",") !== remedyIds.sort().join(","),
      ),
    ].slice(0, 10);

    setHistory(newHistory);

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      logger.error("Failed to save comparison history", error);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      logger.error("Failed to clear comparison history", error);
    }
  };

  return { history, addToHistory, clearHistory };
}

export default ComparisonHistory;
