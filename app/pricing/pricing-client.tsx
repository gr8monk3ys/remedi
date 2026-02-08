"use client";

/**
 * Pricing Client Component
 *
 * Interactive parts of the pricing page - plan selection, billing interval toggle,
 * trial start, and checkout.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles, Zap, Crown } from "lucide-react";
import { PLANS, type PlanType } from "@/lib/stripe-config";
import { fetchWithCSRF } from "@/lib/fetch";
import { getSessionId } from "@/lib/session";
import { getOrSetExperimentVariant } from "@/lib/experiments/client";
import {
  CONVERSION_EVENT_TYPES,
  EVENT_SOURCES,
} from "@/lib/analytics/conversion-event-types";

interface PricingClientProps {
  currentPlan: PlanType;
  hasActiveSubscription: boolean;
  trialEligible: boolean;
  isAuthenticated: boolean;
}

export function PricingClient({
  currentPlan,
  hasActiveSubscription,
  trialEligible,
  isAuthenticated,
}: PricingClientProps) {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(true); // Default to yearly (better value)
  const [loading, setLoading] = useState<string | null>(null);
  const [experimentVariant, setExperimentVariant] = useState("control");

  const trackConversionEvent = async (payload: {
    eventType: string;
    planTarget?: PlanType;
    metadata?: Record<string, unknown>;
  }) => {
    try {
      await fetchWithCSRF("/api/conversion-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: payload.eventType,
          eventSource: EVENT_SOURCES.PRICING_PAGE,
          planTarget: payload.planTarget,
          sessionId: getSessionId(),
          metadata: payload.metadata,
        }),
      });
    } catch (error) {
      console.warn("[pricing] Failed to track conversion event", error);
    }
  };

  useEffect(() => {
    const experimentId = "pricing_v1";
    const variant = getOrSetExperimentVariant(experimentId, [
      "control",
      "monthly_default",
    ]);
    setExperimentVariant(variant);
    if (variant === "monthly_default") {
      setIsYearly(false);
    }

    void trackConversionEvent({
      eventType: CONVERSION_EVENT_TYPES.PRICING_PAGE_VIEWED,
      metadata: {
        experimentId,
        variantId: variant,
        defaultInterval: variant === "monthly_default" ? "month" : "year",
      },
    });
  }, []);

  const handleStartTrial = async () => {
    if (!isAuthenticated) {
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }

    void trackConversionEvent({
      eventType: CONVERSION_EVENT_TYPES.PRICING_PLAN_SELECTED,
      planTarget: "premium",
      metadata: {
        interval: isYearly ? "year" : "month",
        experimentId: "pricing_v1",
        variantId: experimentVariant,
        isTrial: true,
      },
    });

    setLoading("trial");
    try {
      const response = await fetchWithCSRF("/api/trial/start", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        router.push("/billing?trial=true");
        router.refresh();
      } else {
        alert(data.error?.message || "Failed to start trial");
      }
    } catch (error) {
      console.error("Trial start error:", error);
      alert("Failed to start trial. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleCheckout = async (plan: PlanType) => {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect_url=/pricing`);
      return;
    }

    if (plan === "free" || plan === currentPlan) return;

    void trackConversionEvent({
      eventType: CONVERSION_EVENT_TYPES.PRICING_PLAN_SELECTED,
      planTarget: plan,
      metadata: {
        interval: isYearly ? "year" : "month",
        experimentId: "pricing_v1",
        variantId: experimentVariant,
      },
    });

    setLoading(plan);
    try {
      // Send plan and interval to server - server will look up the price ID
      const response = await fetchWithCSRF("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          interval: isYearly ? "year" : "month",
        }),
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
      setLoading(null);
    }
  };

  // Calculate prices
  const basicMonthlyPrice = PLANS.basic.price;
  const basicYearlyPrice = PLANS.basic.yearlyPrice;
  const basicYearlyMonthly = basicYearlyPrice / 12;

  const premiumMonthlyPrice = PLANS.premium.price;
  const premiumYearlyPrice = PLANS.premium.yearlyPrice;
  const premiumYearlyMonthly = premiumYearlyPrice / 12;

  const yearlyDiscount = 20; // 20% discount

  return (
    <div id="pricing">
      {/* Billing Interval Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-xl inline-flex items-center gap-2">
          <button
            onClick={() => {
              setIsYearly(false);
              void trackConversionEvent({
                eventType: CONVERSION_EVENT_TYPES.PRICING_INTERVAL_TOGGLED,
                metadata: {
                  interval: "month",
                  experimentId: "pricing_v1",
                  variantId: experimentVariant,
                },
              });
            }}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              !isYearly
                ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => {
              setIsYearly(true);
              void trackConversionEvent({
                eventType: CONVERSION_EVENT_TYPES.PRICING_INTERVAL_TOGGLED,
                metadata: {
                  interval: "year",
                  experimentId: "pricing_v1",
                  variantId: experimentVariant,
                },
              });
            }}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isYearly
                ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Yearly
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              Save {yearlyDiscount}%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-white dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-zinc-700"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 dark:bg-zinc-700 rounded-lg">
                <Zap className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {PLANS.free.name}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {PLANS.free.description}
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                $0
              </span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
            </div>

            <button
              disabled={currentPlan === "free"}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                currentPlan === "free"
                  ? "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 cursor-default"
                  : "bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-500"
              }`}
            >
              {currentPlan === "free" ? "Current Plan" : "Downgrade"}
            </button>

            <ul className="mt-8 space-y-4">
              {PLANS.free.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                >
                  <Check className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Basic Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-white dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-zinc-700"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {PLANS.basic.name}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {PLANS.basic.description}
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                $
                {isYearly
                  ? basicYearlyMonthly.toFixed(2)
                  : basicMonthlyPrice.toFixed(2)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
              {isYearly && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Billed ${basicYearlyPrice.toFixed(2)}/year
                </p>
              )}
            </div>

            <button
              onClick={() => handleCheckout("basic")}
              disabled={
                loading === "basic" ||
                currentPlan === "basic" ||
                currentPlan === "premium"
              }
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                currentPlan === "basic"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default"
                  : currentPlan === "premium"
                    ? "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
              }`}
            >
              {loading === "basic" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : currentPlan === "basic" ? (
                <>
                  <Check className="w-5 h-5" />
                  Current Plan
                </>
              ) : currentPlan === "premium" ? (
                "Included"
              ) : (
                "Get Started"
              )}
            </button>

            <ul className="mt-8 space-y-4">
              {PLANS.basic.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                >
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Premium Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden border-2 border-blue-500 dark:border-blue-400"
        >
          {/* Popular badge */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 text-sm font-medium">
            <Crown className="w-4 h-4 inline mr-1" />
            Most Popular
          </div>

          <div className="p-8 pt-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {PLANS.premium.name}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {PLANS.premium.description}
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                $
                {isYearly
                  ? premiumYearlyMonthly.toFixed(2)
                  : premiumMonthlyPrice.toFixed(2)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
              {isYearly && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Billed ${premiumYearlyPrice.toFixed(2)}/year
                </p>
              )}
            </div>

            {/* Trial CTA for eligible users */}
            {trialEligible && currentPlan === "free" && (
              <button
                onClick={handleStartTrial}
                disabled={loading === "trial"}
                className="w-full py-3 px-4 mb-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {loading === "trial" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Start 7-Day Free Trial
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => handleCheckout("premium")}
              disabled={loading === "premium" || currentPlan === "premium"}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                currentPlan === "premium"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {loading === "premium" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : currentPlan === "premium" ? (
                <>
                  <Check className="w-5 h-5" />
                  Current Plan
                </>
              ) : trialEligible && currentPlan === "free" ? (
                "Subscribe Now"
              ) : (
                "Upgrade to Premium"
              )}
            </button>

            <ul className="mt-8 space-y-4">
              {PLANS.premium.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                >
                  <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Manage subscription link */}
      {hasActiveSubscription && (
        <div className="mt-12 text-center">
          <a
            href="/billing"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Manage your subscription
          </a>
        </div>
      )}

      {/* Not signed in message */}
      {!isAuthenticated && (
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Already have an account?
          </p>
          <Link
            href="/sign-in?redirect_url=/pricing"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Sign in to manage your subscription
          </Link>
        </div>
      )}
    </div>
  );
}
