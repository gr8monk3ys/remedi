"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  TrendingUp,
  Pill,
  Leaf,
  Moon,
  Heart,
  X,
  ArrowRight,
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { cn } from "@/lib/utils";

// Suggested search categories with examples
const SEARCH_SUGGESTIONS = [
  {
    category: "Pain Relief",
    icon: <Pill className="w-5 h-5" />,
    color: "blue",
    examples: ["aspirin alternatives", "ibuprofen natural", "tylenol herbal"],
  },
  {
    category: "Sleep & Relaxation",
    icon: <Moon className="w-5 h-5" />,
    color: "purple",
    examples: [
      "natural sleep aids",
      "melatonin alternatives",
      "insomnia herbs",
    ],
  },
  {
    category: "Heart Health",
    icon: <Heart className="w-5 h-5" />,
    color: "red",
    examples: [
      "omega-3 sources",
      "blood pressure natural",
      "cholesterol herbs",
    ],
  },
  {
    category: "Natural Supplements",
    icon: <Leaf className="w-5 h-5" />,
    color: "green",
    examples: ["vitamin D natural", "iron supplements", "b12 alternatives"],
  },
];

// Trending searches
const TRENDING_SEARCHES = [
  "turmeric benefits",
  "ashwagandha uses",
  "magnesium glycinate",
  "elderberry immune",
  "valerian root",
];

interface FirstSearchGuideProps {
  onSearch?: (query: string) => void;
  onDismiss?: () => void;
  className?: string;
}

export function FirstSearchGuide({
  onSearch,
  onDismiss,
  className,
}: FirstSearchGuideProps) {
  const { shouldShowFirstSearchGuide, completeFirstSearch, isLoaded } =
    useOnboarding();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Handle search selection
  const handleSearch = useCallback(
    (query: string): void => {
      setShowCelebration(true);
      onSearch?.(query);

      // Complete the first search after animation
      setTimeout(() => {
        completeFirstSearch();
        setShowCelebration(false);
      }, 2000);
    },
    [onSearch, completeFirstSearch],
  );

  // Handle dismiss
  const handleDismiss = useCallback((): void => {
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  // Don't render if not loaded, shouldn't show, or dismissed
  if (!isLoaded || !shouldShowFirstSearchGuide || !isVisible) {
    return null;
  }

  // Color classes mapping
  const colorClasses: Record<
    string,
    { bg: string; text: string; hover: string }
  > = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      hover: "hover:bg-blue-100 dark:hover:bg-blue-900/50",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      hover: "hover:bg-purple-100 dark:hover:bg-purple-900/50",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400",
      hover: "hover:bg-red-100 dark:hover:bg-red-900/50",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
      hover: "hover:bg-green-100 dark:hover:bg-green-900/50",
    },
  };

  return (
    <>
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="p-8 bg-card rounded-2xl shadow-2xl text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                }}
                className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-green-100 dark:bg-green-900 rounded-full"
              >
                <Sparkles className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Great Start!
              </h3>
              <p className="text-muted-foreground">
                Finding natural alternatives for you...
              </p>
              {/* Confetti effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: "50%",
                      y: "50%",
                      scale: 0,
                    }}
                    animate={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: [0, 1, 0],
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "absolute w-3 h-3 rounded-full",
                      i % 3 === 0 && "bg-green-500",
                      i % 3 === 1 && "bg-blue-500",
                      i % 3 === 2 && "bg-purple-500",
                    )}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search guide panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "bg-card rounded-xl shadow-lg border border-border overflow-hidden",
          className,
        )}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Ready to find natural alternatives?
                </h3>
                <p className="text-sm text-white/80">
                  Try one of these popular searches
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-white/70 hover:text-white transition-colors"
              aria-label="Dismiss suggestions"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {SEARCH_SUGGESTIONS.map((suggestion) => {
              const colors = colorClasses[suggestion.color];
              const isSelected = selectedCategory === suggestion.category;

              return (
                <button
                  key={suggestion.category}
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : suggestion.category)
                  }
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all",
                    isSelected
                      ? `${colors.bg} ${colors.text} ring-2 ring-offset-2 ring-current`
                      : `${colors.bg} ${colors.text} ${colors.hover}`,
                  )}
                >
                  {suggestion.icon}
                  {suggestion.category}
                </button>
              );
            })}
          </div>

          {/* Selected category examples */}
          <AnimatePresence mode="wait">
            {selectedCategory && (
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Click to search:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SEARCH_SUGGESTIONS.find(
                      (s) => s.category === selectedCategory,
                    )?.examples.map((example) => (
                      <button
                        key={example}
                        onClick={() => handleSearch(example)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-muted text-foreground rounded-full text-sm hover:bg-muted/80 transition-colors"
                      >
                        {example}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trending searches */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-foreground">
                Trending Searches
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((search) => (
                <button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Pro tip */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Pro tip:</span> Enable AI search
                to describe symptoms naturally, like &quot;I need help with
                anxiety&quot; or &quot;natural energy boost&quot;.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
