"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompare, Trash2 } from "lucide-react";
import { useCompare } from "@/lib/context/CompareContext";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
          className={`fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md print:hidden ${className}`}
          role="region"
          aria-label="Comparison selection bar"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Selected items display */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="eyebrow eyebrow-muted whitespace-nowrap">
                  Compare ({items.length}/{maxItems})
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
                      <div className="relative h-11 w-11 overflow-hidden rounded-md border border-border bg-muted">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
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
                      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
                        {item.name}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
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
                            className="flex h-11 w-11 items-center justify-center rounded-md border border-dashed border-border-strong"
                          >
                            <span className="font-mono text-xs text-muted-foreground">
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
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  aria-label="Clear all selected remedies"
                  title="Clear all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Compare button */}
                <Link
                  href={getCompareUrl()}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    items.length < 2 &&
                      "pointer-events-none bg-muted text-muted-foreground",
                  )}
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
