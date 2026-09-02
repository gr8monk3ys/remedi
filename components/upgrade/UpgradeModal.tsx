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
      // Stripe price IDs are server-side only, so the client identifies the
      // plan by name and interval and lets /api/checkout resolve the price.
      const data = await apiClient.post<{ url: string }>("/api/checkout", {
        plan,
        interval: "month",
        source: "upgrade_modal",
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full z-50 flex max-h-[90vh] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl"
          >
            {/* Header */}
            <div className="premium-gradient-panel relative px-6 py-8 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md border border-white/20 bg-white/10 p-2">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-semibold">{message.title}</h2>
              </div>
              <p className="text-white/90">{message.description}</p>

              {/* Usage indicator if applicable */}
              {currentUsage !== undefined &&
                limit !== undefined &&
                limit > 0 && (
                  <div className="mt-4 rounded-md border border-white/15 bg-white/10 p-3">
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
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-1">
                    {PLANS.basic.name}
                  </h4>
                  <div className="mb-3">
                    <span className="tabular text-2xl font-semibold tracking-tight text-foreground">
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
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade("basic")}
                    disabled={
                      loadingCheckout === "basic" || currentPlan === "basic"
                    }
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="relative rounded-lg border border-primary p-4 ring-1 ring-primary">
                  <div className="absolute -top-2.5 left-4 rounded-sm bg-primary px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-primary-foreground">
                    Most Popular
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {PLANS.premium.name}
                  </h4>
                  <div className="mb-3">
                    <span className="tabular text-2xl font-semibold tracking-tight text-foreground">
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
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade("premium")}
                    disabled={
                      loadingCheckout === "premium" || currentPlan === "premium"
                    }
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="border-t border-border bg-muted/50 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Trial option */}
                {trialEligible && currentPlan === "free" && (
                  <button
                    onClick={handleStartTrial}
                    disabled={isStartingTrial}
                    className="flex items-center gap-2 font-medium text-primary hover:underline"
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
