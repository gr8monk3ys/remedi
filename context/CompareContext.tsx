"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { createLogger } from "@/lib/logger";

const logger = createLogger("compare-context");

/**
 * Remedy item for comparison
 */
export interface CompareItem {
  id: string;
  name: string;
  category?: string;
  imageUrl?: string;
}

/**
 * Compare context state and actions
 */
interface CompareContextValue {
  /** List of items to compare */
  items: CompareItem[];
  /** Maximum number of items allowed */
  maxItems: number;
  /** Whether the comparison list is full */
  isFull: boolean;
  /** Check if a remedy is in the comparison list */
  isInComparison: (id: string) => boolean;
  /** Add a remedy to the comparison list */
  addToCompare: (item: CompareItem) => boolean;
  /** Remove a remedy from the comparison list */
  removeFromCompare: (id: string) => void;
  /** Clear all items from the comparison list */
  clearComparison: () => void;
  /** Get the comparison URL */
  getCompareUrl: () => string;
}

const CompareContext = createContext<CompareContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "remedi-comparison-list";
const MAX_COMPARE_ITEMS = 4;

interface CompareProviderProps {
  children: ReactNode;
}

/**
 * Provider for remedy comparison functionality
 * Manages comparison list state and persists to localStorage
 */
export function CompareProvider({
  children,
}: CompareProviderProps): React.JSX.Element {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CompareItem[];
        // Validate stored data
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) =>
              typeof item.id === "string" && typeof item.name === "string",
          )
        ) {
          setItems(parsed.slice(0, MAX_COMPARE_ITEMS));
        }
      }
    } catch (error) {
      logger.error("Failed to load comparison list from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage when items change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        logger.error("Failed to save comparison list to localStorage", error);
      }
    }
  }, [items, isHydrated]);

  const isFull = items.length >= MAX_COMPARE_ITEMS;

  const isInComparison = useCallback(
    (id: string): boolean => {
      return items.some((item) => item.id === id);
    },
    [items],
  );

  const addToCompare = useCallback(
    (item: CompareItem): boolean => {
      if (items.length >= MAX_COMPARE_ITEMS) {
        return false;
      }
      if (items.some((existing) => existing.id === item.id)) {
        return false;
      }
      setItems((prev) => [...prev, item]);
      return true;
    },
    [items],
  );

  const removeFromCompare = useCallback((id: string): void => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearComparison = useCallback((): void => {
    setItems([]);
  }, []);

  const getCompareUrl = useCallback((): string => {
    if (items.length === 0) return "/compare";
    const ids = items.map((item) => item.id).join(",");
    return `/compare?ids=${encodeURIComponent(ids)}`;
  }, [items]);

  const value = useMemo(
    (): CompareContextValue => ({
      items,
      maxItems: MAX_COMPARE_ITEMS,
      isFull,
      isInComparison,
      addToCompare,
      removeFromCompare,
      clearComparison,
      getCompareUrl,
    }),
    [
      items,
      isFull,
      isInComparison,
      addToCompare,
      removeFromCompare,
      clearComparison,
      getCompareUrl,
    ],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

/**
 * Hook to access comparison functionality
 * @throws Error if used outside CompareProvider
 */
export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
