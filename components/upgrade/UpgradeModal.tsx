"use client";

/**
 * Upgrade Modal Component
 *
 * A modal dialog triggered when users hit plan limits.
 * Shows what features they're missing and provides upgrade options.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Zap,
  Search,
  Heart,
  BarChart3,
  Download,
  Sparkles,
  Clock,
  Loader2,
} from "lucide-react";
import { PLANS, type PlanType } from "@/lib/stripe-config";
import { fetchWithCSRF } from "@/lib/fetch";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?:
    | "search_limit"
    | "ai_search_limit"
    | "favorite_limit"
    | "compare_limit"
    | "export"
    | "history"
    | "feature";
  currentPlan?: PlanType;
  featureName?: string;
  currentUsage?: number;
  limit?: number;
}

// Feature icons mapping
const featureIcons: Record<string, React.ReactNode> = {
  searches: <Search className="w-5 h-5" />,
  favorites: <Heart className="w-5 h-5" />,
  aiSearches: <Sparkles className="w-5 h-5" />,
  compare: <BarChart3 className="w-5 h-5" />,
  export: <Download className="w-5 h-5" />,
  history: <Clock className="w-5 h-5" />,
};

// Trigger reason messages
const triggerMessages: Record<string, { title: string; description: string }> =
  {
    search_limit: {
      title: "You've reached your daily search limit",
      description: "Upgrade to get more searches and unlock powerful features.",
    },
    ai_search_limit: {
      title: "AI search limit reached",
      description:
        "Get more AI-powered searches to find the perfect natural remedies.",
    },
    favorite_limit: {
      title: "You've saved the maximum favorites",
      description:
        "Upgrade to save unlimited favorites and organize your remedies.",
    },
    compare_limit: {
      title: "Compare more remedies",
      description: "Upgrade to compare more remedies side by side.",
    },
    export: {
      title: "Export is a premium feature",
      description: "Upgrade to export your data and favorites.",
    },
    history: {
      title: "Search history is a premium feature",
      description: "Upgrade to access your complete search history.",
    },
    feature: {
      title: "Unlock this feature",
      description: "Upgrade your plan to access premium features.",
    },
  };

// Plan comparison data
const planComparison = [
  {
    feature: "Daily searches",
    free: "5",
    basic: "100",
    premium: "Unlimited",
    icon: "searches",
  },
  {
    feature: "Saved favorites",
    free: "3",
    basic: "50",
    premium: "Unlimited",
    icon: "favorites",
  },
  {
    feature: "AI-powered searches",
    free: "-",
    basic: "10/day",
    premium: "50/day",
    icon: "aiSearches",
  },
  {
    feature: "Compare remedies",
    free: "-",
    basic: "Up to 4",
    premium: "Up to 10",
    icon: "compare",
  },
  {
    feature: "Search history",
    free: "-",
    basic: "Full access",
    premium: "Full access",
    icon: "history",
  },
  {
    feature: "Export data",
    free: "-",
    basic: "Yes",
    premium: "Yes",
    icon: "export",
  },
];

export function UpgradeModal({
  isOpen,
  onClose,
  triggerReason = "feature",
  currentPlan = "free",
  featureName,
  currentUsage,
  limit,
}: UpgradeModalProps) {
  // featureName is used for accessibility but not directly rendered
  void featureName;
  const router = useRouter();
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [trialEligible, setTrialEligible] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  // Check trial eligibility when modal opens
  useEffect(() => {
    if (isOpen) {
      checkTrialEligibility();
    }
  }, [isOpen]);

  const checkTrialEligibility = async () => {
    try {
      const response = await fetch("/api/trial/check");
      const data = await response.json();
      if (data.success) {
        setTrialEligible(data.data.isEligible);
      }
    } catch {
      // Silently fail - trial button just won't show
    }
  };

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    try {
      const response = await fetchWithCSRF("/api/trial/start", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        onClose();
        router.refresh();
      } else {
        alert(data.error?.message || "Failed to start trial");
      }
    } catch (error) {
      console.error("Trial start error:", error);
      alert("Failed to start trial. Please try again.");
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handleUpgrade = async (plan: PlanType) => {
    if (plan === "free") return;

    setLoadingCheckout(plan);
    try {
      const planConfig = PLANS[plan];
      if (!("monthlyPriceId" in planConfig)) return;

      const priceId = planConfig.monthlyPriceId;

      const response = await fetchWithCSRF("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        alert(data.error?.message || "Failed to start checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handleViewPricing = useCallback(() => {
    onClose();
    router.push("/pricing");
  }, [onClose, router]);

  const message = triggerMessages[triggerReason];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">{message.title}</h2>
              </div>
              <p className="text-white/90">{message.description}</p>

              {/* Usage indicator if applicable */}
              {currentUsage !== undefined &&
                limit !== undefined &&
                limit > 0 && (
                  <div className="mt-4 bg-white/10 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Usage today</span>
                      <span>
                        {currentUsage} / {limit}
                      </span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (currentUsage / limit) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Feature comparison table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Compare Plans
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-zinc-700">
                        <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">
                          Feature
                        </th>
                        <th className="text-center py-3 px-2 font-medium text-gray-500 dark:text-gray-400">
                          Free
                        </th>
                        <th className="text-center py-3 px-2 font-medium text-gray-500 dark:text-gray-400">
                          Basic
                        </th>
                        <th className="text-center py-3 px-2 font-medium text-blue-600 dark:text-blue-400">
                          Premium
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {planComparison.map((row) => (
                        <tr
                          key={row.feature}
                          className="border-b border-gray-100 dark:border-zinc-800"
                        >
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">
                                {featureIcons[row.icon]}
                              </span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {row.feature}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2 text-gray-500 dark:text-gray-400">
                            {row.free === "-" ? (
                              <span className="text-gray-300 dark:text-gray-600">
                                -
                              </span>
                            ) : (
                              row.free
                            )}
                          </td>
                          <td className="text-center py-3 px-2 text-gray-700 dark:text-gray-300">
                            {row.basic === "-" ? (
                              <span className="text-gray-300 dark:text-gray-600">
                                -
                              </span>
                            ) : (
                              row.basic
                            )}
                          </td>
                          <td className="text-center py-3 px-2 font-medium text-blue-600 dark:text-blue-400">
                            {row.premium === "-" ? (
                              <span className="text-gray-300 dark:text-gray-600">
                                -
                              </span>
                            ) : (
                              row.premium
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upgrade cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Basic Plan */}
                <div className="border border-gray-200 dark:border-zinc-700 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {PLANS.basic.name}
                  </h4>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${PLANS.basic.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      /month
                    </span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {PLANS.basic.features.slice(0, 4).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade("basic")}
                    disabled={
                      loadingCheckout === "basic" || currentPlan === "basic"
                    }
                    className="w-full py-2 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingCheckout === "basic" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentPlan === "basic" ? (
                      "Current Plan"
                    ) : (
                      "Upgrade to Basic"
                    )}
                  </button>
                </div>

                {/* Premium Plan */}
                <div className="border-2 border-blue-500 rounded-xl p-4 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {PLANS.premium.name}
                  </h4>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${PLANS.premium.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      /month
                    </span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {PLANS.premium.features.slice(0, 4).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade("premium")}
                    disabled={
                      loadingCheckout === "premium" || currentPlan === "premium"
                    }
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingCheckout === "premium" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentPlan === "premium" ? (
                      "Current Plan"
                    ) : (
                      "Upgrade to Premium"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-zinc-700 px-6 py-4 bg-gray-50 dark:bg-zinc-800/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Trial option */}
                {trialEligible && currentPlan === "free" && (
                  <button
                    onClick={handleStartTrial}
                    disabled={isStartingTrial}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {isStartingTrial ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Start 7-day free trial
                  </button>
                )}

                <button
                  onClick={handleViewPricing}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                >
                  View full pricing details
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default UpgradeModal;
