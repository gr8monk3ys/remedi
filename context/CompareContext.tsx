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
import { useAuth } from "@clerk/nextjs";

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
const DEFAULT_MAX_COMPARE_ITEMS = 4;
const ABSOLUTE_MAX_COMPARE_ITEMS = 10;

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
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const [items, setItems] = useState<CompareItem[]>([]);
  const [maxItems, setMaxItems] = useState(DEFAULT_MAX_COMPARE_ITEMS);
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
          // Cap to an absolute maximum so a poisoned localStorage value can't bloat UI.
          setItems(parsed.slice(0, ABSOLUTE_MAX_COMPARE_ITEMS));
        }
      }
    } catch (error) {
      logger.error("Failed to load comparison list from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  // Fetch effective plan limits for signed-in users to set compare cap.
  // Anonymous users keep the default cap (they'll be prompted to upgrade on /compare).
  useEffect(() => {
    if (!isAuthLoaded) return;

    if (!isSignedIn) {
      setMaxItems(DEFAULT_MAX_COMPARE_ITEMS);
      return;
    }

    const controller = new AbortController();

    async function loadPlan() {
      try {
        const res = await fetch("/api/plan", { signal: controller.signal });
        const json = (await res.json()) as
          | {
              success: true;
              data: {
                limits?: { canCompare?: boolean; maxCompareItems?: unknown };
              };
            }
          | { success: false };

        if (!res.ok || !json.success) return;

        const canCompare = Boolean(json.data.limits?.canCompare);
        const maxCompareItems = json.data.limits?.maxCompareItems;

        if (
          canCompare &&
          typeof maxCompareItems === "number" &&
          Number.isFinite(maxCompareItems) &&
          maxCompareItems > 0
        ) {
          setMaxItems(Math.min(maxCompareItems, ABSOLUTE_MAX_COMPARE_ITEMS));
        } else {
          setMaxItems(DEFAULT_MAX_COMPARE_ITEMS);
        }
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") return;
        logger.debug("Failed to load plan limits for compare cap", { error });
      }
    }

    void loadPlan();
    return () => controller.abort();
  }, [isAuthLoaded, isSignedIn]);

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

  // Enforce maxItems even if it changes after hydration.
  useEffect(() => {
    setItems((prev) =>
      prev.length > maxItems ? prev.slice(0, maxItems) : prev,
    );
  }, [maxItems]);

  const isFull = items.length >= maxItems;

  const isInComparison = useCallback(
    (id: string): boolean => {
      return items.some((item) => item.id === id);
    },
    [items],
  );

  const addToCompare = useCallback(
    (item: CompareItem): boolean => {
      if (items.length >= maxItems) {
        return false;
      }
      if (items.some((existing) => existing.id === item.id)) {
        return false;
      }
      setItems((prev) => [...prev, item]);
      return true;
    },
    [items, maxItems],
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
      maxItems,
      isFull,
      isInComparison,
      addToCompare,
      removeFromCompare,
      clearComparison,
      getCompareUrl,
    }),
    [
      items,
      maxItems,
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
