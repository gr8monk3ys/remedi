"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { DetailedRemedy } from "@/lib/types";

/**
 * Evidence level configuration
 */
const EVIDENCE_LEVELS: Record<string, { color: string; bgColor: string }> = {
  Strong: {
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  Moderate: {
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  Limited: {
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  Traditional: {
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
};

/**
 * Extended remedy type for comparison
 */
interface CompareRemedy extends DetailedRemedy {
  evidenceLevel?: string;
  benefits?: string[];
}

/**
 * Props for MobileComparisonSwiper
 */
interface MobileComparisonSwiperProps {
  remedies: CompareRemedy[];
  onRemoveRemedy: (id: string) => void;
  className?: string;
}

/**
 * Mobile-optimized swipe navigation for remedy comparison.
 *
 * Features:
 * - Touch swipe navigation between remedies
 * - Indicator dots for current position
 * - Arrow navigation buttons
 * - Full remedy details in card format
 */
export function MobileComparisonSwiper({
  remedies,
  onRemoveRemedy,
  className = "",
}: MobileComparisonSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToNext = useCallback(() => {
    if (currentIndex < remedies.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, remedies.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious]);

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  /**
   * Handle swipe gesture
   */
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const threshold = 50;

    if (info.offset.x < -threshold && currentIndex < remedies.length - 1) {
      goToNext();
    } else if (info.offset.x > threshold && currentIndex > 0) {
      goToPrevious();
    }
  };

  if (remedies.length === 0) {
    return null;
  }

  const currentRemedy = remedies[currentIndex];

  return (
    <div className={`relative ${className}`}>
      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        disabled={currentIndex === 0}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 shadow-md backdrop-blur-sm transition-opacity ${
          currentIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-card"
        }`}
        aria-label="Previous remedy"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={goToNext}
        disabled={currentIndex === remedies.length - 1}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 shadow-md backdrop-blur-sm transition-opacity ${
          currentIndex === remedies.length - 1
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-card"
        }`}
        aria-label="Next remedy"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Swipeable content */}
      <div ref={containerRef} className="overflow-hidden rounded-xl">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRemedy.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-xl shadow-sm overflow-hidden"
            >
              {/* Remove button */}
              <button
                onClick={() => onRemoveRemedy(currentRemedy.id)}
                className="absolute top-3 right-3 z-10 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                aria-label={`Remove ${currentRemedy.name} from comparison`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Remedy image */}
              <div className="relative h-48 bg-muted">
                {currentRemedy.imageUrl ? (
                  <Image
                    src={currentRemedy.imageUrl}
                    alt={currentRemedy.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>

              {/* Remedy details */}
              <div className="p-4">
                <Link
                  href={`/remedy/${currentRemedy.id}`}
                  className="text-xl font-bold text-foreground hover:text-primary transition-colors"
                >
                  {currentRemedy.name}
                </Link>

                {currentRemedy.category && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded ml-2">
                    {currentRemedy.category}
                  </span>
                )}

                {/* Evidence level */}
                {currentRemedy.evidenceLevel && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-muted-foreground block mb-1">
                      Evidence Level
                    </span>
                    {(() => {
                      const config = EVIDENCE_LEVELS[
                        currentRemedy.evidenceLevel
                      ] || {
                        color: "text-muted-foreground",
                        bgColor: "bg-muted",
                      };
                      return (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${config.color} ${config.bgColor}`}
                        >
                          {currentRemedy.evidenceLevel}
                        </span>
                      );
                    })()}
                  </div>
                )}

                {/* Benefits */}
                <div className="mt-4">
                  <span className="text-xs font-medium text-muted-foreground block mb-2">
                    Benefits
                  </span>
                  <ul className="space-y-1">
                    {(
                      currentRemedy.benefits ||
                      currentRemedy.matchingNutrients ||
                      []
                    )
                      .slice(0, 4)
                      .map((benefit, index) => (
                        <li
                          key={index}
                          className="text-sm text-foreground flex items-start gap-2"
                        >
                          <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Dosage */}
                <div className="mt-4">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">
                    Dosage
                  </span>
                  <p className="text-sm text-foreground">
                    {currentRemedy.dosage || "Dosage information not available"}
                  </p>
                </div>

                {/* Usage */}
                <div className="mt-4">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">
                    Usage
                  </span>
                  <p className="text-sm text-foreground line-clamp-3">
                    {currentRemedy.usage || "Usage information not available"}
                  </p>
                </div>

                {/* Precautions */}
                <div className="mt-4">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">
                    Precautions
                  </span>
                  <p className="text-sm text-amber-700 dark:text-amber-400 line-clamp-3">
                    {currentRemedy.precautions ||
                      "Precaution information not available"}
                  </p>
                </div>

                {/* View full details link */}
                <Link
                  href={`/remedy/${currentRemedy.id}`}
                  className="mt-4 inline-flex items-center text-sm text-primary hover:underline"
                >
                  View full details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Indicator dots */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {remedies.map((remedy, index) => (
          <button
            key={remedy.id}
            onClick={() => goToIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === currentIndex
                ? "bg-primary"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to ${remedy.name}`}
            aria-current={index === currentIndex ? "true" : "false"}
          />
        ))}
      </div>

      {/* Current position text */}
      <p className="text-center text-sm text-muted-foreground mt-2">
        {currentIndex + 1} of {remedies.length}
      </p>
    </div>
  );
}

export default MobileComparisonSwiper;
