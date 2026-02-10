"use client";

/**
 * Pricing Client Component
 *
 * Interactive parts of the pricing page - plan selection, billing interval toggle,
 * trial start, and checkout.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PLANS,
  YEARLY_DISCOUNT_PERCENT,
  type PlanType,
} from "@/lib/stripe-config";
import { fetchWithCSRF } from "@/lib/fetch";
import { getSessionId } from "@/lib/session";
import { getOrSetExperimentVariant } from "@/lib/experiments/client";
import {
  CONVERSION_EVENT_TYPES,
  EVENT_SOURCES,
} from "@/lib/analytics/conversion-event-types";
import { createLogger } from "@/lib/logger";
import { PricingCards } from "./PricingCards";

const logger = createLogger("pricing");

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
      logger.warn("Failed to track conversion event", { error });
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
        toast.error(data.error?.message || "Failed to start trial");
      }
    } catch (error) {
      logger.error("Trial start error", error);
      toast.error("Failed to start trial. Please try again.");
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
        toast.error(data.error?.message || "Failed to start checkout");
      }
    } catch (error) {
      logger.error("Checkout error", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  // Calculate display prices
  const basicYearlyPrice = PLANS.basic.yearlyPrice;
  const premiumYearlyPrice = PLANS.premium.yearlyPrice;

  const basicDisplayPrice = isYearly
    ? (basicYearlyPrice / 12).toFixed(2)
    : PLANS.basic.price.toFixed(2);
  const premiumDisplayPrice = isYearly
    ? (premiumYearlyPrice / 12).toFixed(2)
    : PLANS.premium.price.toFixed(2);

  return (
    <div id="pricing">
      {/* Billing Interval Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-muted p-1.5 rounded-xl inline-flex items-center gap-2">
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
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
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
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              Save {YEARLY_DISCOUNT_PERCENT}%
            </span>
          </button>
        </div>
      </div>

      <PricingCards
        currentPlan={currentPlan}
        isYearly={isYearly}
        loading={loading}
        trialEligible={trialEligible}
        onCheckout={handleCheckout}
        onStartTrial={handleStartTrial}
        basicDisplayPrice={basicDisplayPrice}
        basicYearlyBilled={basicYearlyPrice.toFixed(2)}
        premiumDisplayPrice={premiumDisplayPrice}
        premiumYearlyBilled={premiumYearlyPrice.toFixed(2)}
      />

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
          <p className="text-muted-foreground mb-4">Already have an account?</p>
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
