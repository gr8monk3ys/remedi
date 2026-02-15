"use client";

/**
 * Billing Client Component
 *
 * Interactive parts of the billing page - plan selection and checkout.
 */

import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, CreditCard, Sparkles } from "lucide-react";
import { PLANS, type PlanType } from "@/lib/stripe-config";
import { fetchWithCSRF } from "@/lib/fetch";
import { createLogger } from "@/lib/logger";

const logger = createLogger("billing");

interface BillingClientProps {
  currentPlan: PlanType;
  hasActiveSubscription: boolean;
}

export function BillingClient({
  currentPlan,
  hasActiveSubscription,
}: BillingClientProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: "basic" | "premium") => {
    if (plan === currentPlan) return;

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
        toast.error(data.error?.message || "Failed to start checkout");
      }
    } catch (error) {
      logger.error("Checkout error", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleSelectPlan = async (plan: PlanType) => {
    if (plan === "free" || plan === currentPlan) return;

    // If the user already has an active subscription, plan changes should be
    // done via the Stripe billing portal to avoid creating duplicate subs.
    if (hasActiveSubscription) {
      await handleManageBilling();
      return;
    }

    await handleCheckout(plan);
  };

  const handleManageBilling = async () => {
    setLoading("manage");
    try {
      const response = await fetchWithCSRF("/api/billing-portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        toast.error(data.error?.message || "Failed to open billing portal");
      }
    } catch (error) {
      logger.error("Billing portal error", error);
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {/* Billing Interval Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-lg inline-flex">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isYearly
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isYearly
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Yearly
            <span className="ml-1 text-green-600 dark:text-green-400 text-xs">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <PlanCard
          plan="free"
          name={PLANS.free.name}
          description={PLANS.free.description}
          price={0}
          features={PLANS.free.features}
          isCurrentPlan={currentPlan === "free"}
          onSelect={() => {}}
          loading={false}
          disabled
        />

        {/* Basic Plan */}
        <PlanCard
          plan="basic"
          name={PLANS.basic.name}
          description={PLANS.basic.description}
          price={isYearly ? PLANS.basic.yearlyPrice / 12 : PLANS.basic.price}
          yearlyPrice={isYearly ? PLANS.basic.yearlyPrice : undefined}
          features={PLANS.basic.features}
          isCurrentPlan={currentPlan === "basic"}
          onSelect={() => void handleSelectPlan("basic")}
          loading={loading === "basic"}
          disabled={currentPlan === "basic"}
        />

        {/* Premium Plan */}
        <PlanCard
          plan="premium"
          name={PLANS.premium.name}
          description={PLANS.premium.description}
          price={
            isYearly ? PLANS.premium.yearlyPrice / 12 : PLANS.premium.price
          }
          yearlyPrice={isYearly ? PLANS.premium.yearlyPrice : undefined}
          features={PLANS.premium.features}
          isCurrentPlan={currentPlan === "premium"}
          onSelect={() => void handleSelectPlan("premium")}
          loading={loading === "premium"}
          disabled={currentPlan === "premium"}
          highlighted
        />
      </div>

      {hasActiveSubscription && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Plan changes and cancellations are managed in the Stripe billing
          portal.
        </p>
      )}

      {/* Manage Subscription Button */}
      {hasActiveSubscription && (
        <div className="mt-8 text-center">
          <button
            onClick={handleManageBilling}
            disabled={loading === "manage"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading === "manage" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            Manage Subscription
          </button>
          <p className="mt-2 text-sm text-muted-foreground">
            Update payment method, view invoices, or cancel subscription
          </p>
        </div>
      )}
    </div>
  );
}

interface PlanCardProps {
  plan: PlanType;
  name: string;
  description: string;
  price: number;
  yearlyPrice?: number;
  features: readonly string[];
  isCurrentPlan: boolean;
  onSelect: () => void;
  loading: boolean;
  disabled?: boolean;
  highlighted?: boolean;
}

function PlanCard({
  name,
  description,
  price,
  yearlyPrice,
  features,
  isCurrentPlan,
  onSelect,
  loading,
  disabled,
  highlighted,
}: PlanCardProps) {
  return (
    <div
      className={`relative bg-card rounded-xl shadow-md overflow-hidden ${
        highlighted
          ? "ring-2 ring-blue-500 dark:ring-blue-400"
          : "border border-border"
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-1 text-sm font-medium">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Most Popular
        </div>
      )}

      <div className={`p-6 ${highlighted ? "pt-10" : ""}`}>
        <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>

        <div className="mb-6">
          <span className="text-4xl font-bold text-foreground">
            ${price.toFixed(2)}
          </span>
          <span className="text-muted-foreground">/month</span>
          {yearlyPrice && (
            <p className="text-sm text-muted-foreground mt-1">
              Billed ${yearlyPrice.toFixed(2)}/year
            </p>
          )}
        </div>

        <button
          onClick={onSelect}
          disabled={disabled || loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isCurrentPlan
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default"
              : disabled
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : highlighted
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isCurrentPlan ? (
            <>
              <Check className="w-5 h-5" />
              Current Plan
            </>
          ) : disabled ? (
            "Included"
          ) : (
            "Get Started"
          )}
        </button>

        <ul className="mt-6 space-y-3">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
