import type { CompareRemedy } from "./compare.types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("save-comparison-history");

/**
 * Save comparison to localStorage history
 */
export function saveComparisonToHistory(remedies: CompareRemedy[]): void {
  if (typeof window === "undefined") return;

  const HISTORY_KEY = "remedi-comparison-history";
  const MAX_HISTORY = 10;

  try {
    const existingHistory = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]",
    );

    const comparisonEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      remedyIds: remedies.map((r) => r.id),
      remedyNames: remedies.map((r) => r.name),
    };

    // Check if this exact comparison already exists
    const isDuplicate = existingHistory.some(
      (entry: { remedyIds: string[] }) =>
        entry.remedyIds.sort().join(",") ===
        comparisonEntry.remedyIds.sort().join(","),
    );

    if (!isDuplicate) {
      const newHistory = [comparisonEntry, ...existingHistory].slice(
        0,
        MAX_HISTORY,
      );
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    }
  } catch (err) {
    logger.error("Failed to save comparison history", err);
  }
}
