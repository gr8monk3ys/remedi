"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompare, Trash2 } from "lucide-react";
import { useCompare } from "@/context/CompareContext";

/**
 * Props for ComparisonBar component
 */
interface ComparisonBarProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Sticky comparison bar that appears at the bottom of the screen
 * when users have selected remedies for comparison.
 *
 * Features:
 * - Shows mini thumbnails of selected remedies
 * - Allows removing individual items
 * - Compare and Clear buttons
 * - Animates in/out based on selection state
 */
export function ComparisonBar({ className = "" }: ComparisonBarProps) {
  const { items, removeFromCompare, clearComparison, getCompareUrl, maxItems } =
    useCompare();
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show bar when there are items to compare
  useEffect(() => {
    if (isHydrated) {
      setIsVisible(items.length > 0);
    }
  }, [items.length, isHydrated]);

  // Don't render during SSR or when not hydrated
  if (!isHydrated) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg print:hidden ${className}`}
          role="region"
          aria-label="Comparison selection bar"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Selected items display */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Compare ({items.length}/{maxItems}):
                </span>

                {/* Item thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                      className="relative group flex-shrink-0"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted border-2 border-border">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            {item.name.charAt(0)}
                          </div>
                        )}

                        {/* Remove button overlay */}
                        <button
                          onClick={() => removeFromCompare(item.id)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          aria-label={`Remove ${item.name} from comparison`}
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Tooltip with name */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {item.name}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>
                    </motion.div>
                  ))}

                  {/* Empty slots indicator */}
                  {items.length < maxItems && (
                    <div className="flex items-center gap-2">
                      {Array.from({ length: maxItems - items.length }).map(
                        (_, index) => (
                          <div
                            key={index}
                            className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center"
                          >
                            <span className="text-muted-foreground text-xs">
                              +
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Clear button */}
                <button
                  onClick={clearComparison}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  aria-label="Clear all selected remedies"
                  title="Clear all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                {/* Compare button */}
                <Link
                  href={getCompareUrl()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    items.length >= 2
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (items.length < 2) {
                      e.preventDefault();
                    }
                  }}
                  aria-disabled={items.length < 2}
                >
                  <GitCompare className="w-4 h-4" />
                  <span className="hidden sm:inline">Compare Now</span>
                  <span className="sm:hidden">Compare</span>
                </Link>
              </div>
            </div>

            {/* Hint text for minimum items */}
            {items.length === 1 && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-muted-foreground mt-2 text-center sm:text-left"
              >
                Add at least one more remedy to compare
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ComparisonBar;
