"use client";

/**
 * Usage Limit Banner Component
 *
 * Shows warning banners when users are approaching or have reached their plan limits.
 * Provides contextual upgrade suggestions.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  X,
  Zap,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { type PlanType } from "@/lib/stripe-config";
import { UpgradeModal } from "./UpgradeModal";

type LimitType = "searches" | "aiSearches" | "favorites" | "comparisons";

interface UsageData {
  used: number;
  limit: number;
  percentage: number;
  isWithinLimit: boolean;
}

interface UsageSummary {
  plan: PlanType;
  isTrial: boolean;
  searches: UsageData;
  aiSearches: UsageData;
  favorites: UsageData;
  comparisons: UsageData;
}

interface UsageLimitBannerProps {
  /**
   * The type of limit to display
   * If not provided, automatically detects the most relevant limit
   */
  limitType?: LimitType;
  /**
   * Threshold percentage at which to show warning (default: 80)
   */
  warningThreshold?: number;
  /**
   * Whether to auto-dismiss after a timeout
   */
  autoDismiss?: boolean;
  /**
   * Auto-dismiss timeout in milliseconds (default: 10000)
   */
  dismissTimeout?: number;
  /**
   * Whether to show the banner persistently (overrides auto-dismiss)
   */
  persistent?: boolean;
  /**
   * Callback when the banner is dismissed
   */
  onDismiss?: () => void;
  /**
   * Custom className
   */
  className?: string;
}

// Limit display names
const limitNames: Record<LimitType, string> = {
  searches: "searches",
  aiSearches: "AI searches",
  favorites: "saved favorites",
  comparisons: "comparisons",
};

// Limit icons
const limitIcons: Record<LimitType, React.ReactNode> = {
  searches: <TrendingUp className="w-5 h-5" />,
  aiSearches: <Zap className="w-5 h-5" />,
  favorites: <TrendingUp className="w-5 h-5" />,
  comparisons: <TrendingUp className="w-5 h-5" />,
};

export function UsageLimitBanner({
  limitType,
  warningThreshold = 80,
  autoDismiss = false,
  dismissTimeout = 10000,
  persistent = false,
  onDismiss,
  className = "",
}: UsageLimitBannerProps) {
  const { isSignedIn } = useAuth();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeLimit, setActiveLimit] = useState<LimitType | null>(null);

  // Fetch usage data
  const fetchUsage = useCallback(async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/usage");
      const data = await response.json();

      if (data.success) {
        setUsage(data.data as UsageSummary);
      }
    } catch {
      // Silently fail
    }

    setIsLoading(false);
  }, [isSignedIn]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Determine which limit to show
  useEffect(() => {
    if (!usage) return;

    if (limitType) {
      setActiveLimit(limitType);
      return;
    }

    // Auto-detect the most relevant limit
    const limits: LimitType[] = [
      "searches",
      "aiSearches",
      "favorites",
      "comparisons",
    ];

    // First check if any limit is reached
    for (const limit of limits) {
      if (usage[limit].limit > 0 && !usage[limit].isWithinLimit) {
        setActiveLimit(limit);
        return;
      }
    }

    // Then check if any limit is approaching
    for (const limit of limits) {
      if (
        usage[limit].limit > 0 &&
        usage[limit].percentage >= warningThreshold
      ) {
        setActiveLimit(limit);
        return;
      }
    }

    setActiveLimit(null);
  }, [usage, limitType, warningThreshold]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!autoDismiss || persistent || !activeLimit) return;

    const timer = setTimeout(() => {
      setIsDismissed(true);
      onDismiss?.();
    }, dismissTimeout);

    return () => clearTimeout(timer);
  }, [autoDismiss, persistent, activeLimit, dismissTimeout, onDismiss]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const handleRefresh = () => {
    fetchUsage();
  };

  // Don't show if loading, dismissed, no active limit, or not authenticated
  if (isLoading || isDismissed || !activeLimit || !usage || !isSignedIn) {
    return null;
  }

  const limitData = usage[activeLimit];

  // Don't show if limit is -1 (unlimited) or percentage is below threshold
  if (
    limitData.limit === -1 ||
    (limitData.isWithinLimit && limitData.percentage < warningThreshold)
  ) {
    return null;
  }

  const isLimitReached = !limitData.isWithinLimit;
  const limitName = limitNames[activeLimit];

  // Calculate time until reset (midnight UTC)
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  const hoursUntilReset = Math.ceil(
    (midnight.getTime() - now.getTime()) / (1000 * 60 * 60),
  );

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`${className}`}
        >
          <div
            className={`rounded-lg p-4 ${
              isLimitReached
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`flex-shrink-0 p-2 rounded-full ${
                  isLimitReached
                    ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                    : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {isLimitReached ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  limitIcons[activeLimit]
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-semibold ${
                    isLimitReached
                      ? "text-red-800 dark:text-red-200"
                      : "text-yellow-800 dark:text-yellow-200"
                  }`}
                >
                  {isLimitReached
                    ? `Daily ${limitName} limit reached`
                    : `${limitData.percentage}% of daily ${limitName} used`}
                </h4>

                <p
                  className={`text-sm mt-1 ${
                    isLimitReached
                      ? "text-red-700 dark:text-red-300"
                      : "text-yellow-700 dark:text-yellow-300"
                  }`}
                >
                  {isLimitReached
                    ? `You've used all ${limitData.limit} ${limitName} for today.`
                    : `You've used ${limitData.used} of ${limitData.limit} ${limitName} today.`}
                </p>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, limitData.percentage)}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      isLimitReached
                        ? "bg-red-500"
                        : limitData.percentage >= 90
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                    }`}
                  />
                </div>

                {/* Reset time */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Resets in {hoursUntilReset} hour
                      {hoursUntilReset !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </button>
                </div>

                {/* Upgrade CTA */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleUpgradeClick}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isLimitReached
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-yellow-600 hover:bg-yellow-700 text-white"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade for More
                  </button>

                  {usage.plan === "free" && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Trial available with Premium
                    </span>
                  )}
                </div>
              </div>

              {/* Close button */}
              {!persistent && (
                <button
                  onClick={handleDismiss}
                  className={`flex-shrink-0 p-1 rounded-full transition-colors ${
                    isLimitReached
                      ? "hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500"
                      : "hover:bg-yellow-100 dark:hover:bg-yellow-900/40 text-yellow-500"
                  }`}
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerReason={
          activeLimit === "searches"
            ? "search_limit"
            : activeLimit === "aiSearches"
              ? "ai_search_limit"
              : activeLimit === "favorites"
                ? "favorite_limit"
                : "compare_limit"
        }
        currentPlan={usage.plan}
        currentUsage={limitData.used}
        limit={limitData.limit}
      />
    </>
  );
}

/**
 * Compact inline usage indicator
 */
export function UsageIndicator({
  limitType,
  showLabel = true,
  className = "",
}: {
  limitType: LimitType;
  showLabel?: boolean;
  className?: string;
}) {
  const { isSignedIn } = useAuth();
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchUsage = async () => {
      try {
        const response = await fetch("/api/usage");
        const data = await response.json();
        if (data.success) {
          setUsage(data.data as UsageSummary);
        }
      } catch {
        // Silently fail
      }
    };

    fetchUsage();
  }, [isSignedIn]);

  if (!usage || !isSignedIn) {
    return null;
  }

  const limitData = usage[limitType];

  // Don't show for unlimited
  if (limitData.limit === -1) {
    return null;
  }

  const isLow = limitData.percentage >= 80;
  const isExhausted = !limitData.isWithinLimit;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {limitNames[limitType]}:
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isExhausted
                ? "bg-red-500"
                : isLow
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${Math.min(100, limitData.percentage)}%` }}
          />
        </div>
        <span
          className={`text-xs font-medium ${
            isExhausted
              ? "text-red-600 dark:text-red-400"
              : isLow
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {limitData.used}/{limitData.limit}
        </span>
      </div>
    </div>
  );
}

export default UsageLimitBanner;
