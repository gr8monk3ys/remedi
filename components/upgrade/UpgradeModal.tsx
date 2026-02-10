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
import { X, Check, Zap, Sparkles, Loader2 } from "lucide-react";
import { PLANS, type PlanType } from "@/lib/stripe-config";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { TRIGGER_MESSAGES } from "./upgrade-modal.constants";
import { PlanComparisonTable } from "./PlanComparisonTable";

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
      const data = await apiClient.get<{ isEligible: boolean }>(
        "/api/trial/check",
      );
      setTrialEligible(data.isEligible);
    } catch (error) {
      logger.warn("Failed to check trial eligibility", { error });
    }
  };

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    try {
      await apiClient.post("/api/trial/start");
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError
          ? err.message
          : "Failed to start trial. Please try again.",
      );
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

      const data = await apiClient.post<{ url: string }>("/api/checkout", {
        priceId,
      });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(
        err instanceof ApiClientError
          ? err.message
          : "Failed to start checkout. Please try again.",
      );
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handleViewPricing = useCallback(() => {
    onClose();
    router.push("/pricing");
  }, [onClose, router]);

  const message = TRIGGER_MESSAGES[triggerReason];

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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-card rounded-2xl shadow-xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
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
              <PlanComparisonTable />

              {/* Upgrade cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Basic Plan */}
                <div className="border border-border rounded-xl p-4">
                  <h4 className="font-semibold text-foreground mb-1">
                    {PLANS.basic.name}
                  </h4>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-foreground">
                      ${PLANS.basic.price}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {PLANS.basic.features.slice(0, 4).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
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
                    className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <h4 className="font-semibold text-foreground mb-1">
                    {PLANS.premium.name}
                  </h4>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-foreground">
                      ${PLANS.premium.price}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {PLANS.premium.features.slice(0, 4).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
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
            <div className="border-t border-border px-6 py-4 bg-muted">
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
                  className="text-muted-foreground hover:text-foreground text-sm"
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
