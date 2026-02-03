"use client";

/**
 * Billing Client Component
 *
 * Interactive parts of the billing page - plan selection and checkout.
 */

import { useState } from "react";
import { Check, Loader2, CreditCard, Sparkles } from "lucide-react";
import { PLANS, type PlanType } from "@/lib/stripe-config";

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

  const handleCheckout = async (plan: PlanType) => {
    if (plan === "free" || plan === currentPlan) return;

    setLoading(plan);
    try {
      // Send plan and interval to server - server will look up the price ID
      const response = await fetch("/api/checkout", {
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

  const handleManageBilling = async () => {
    setLoading("manage");
    try {
      const response = await fetch("/api/billing-portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        alert(data.error?.message || "Failed to open billing portal");
      }
    } catch (error) {
      console.error("Billing portal error:", error);
      alert("Failed to open billing portal. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {/* Billing Interval Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isYearly
                ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isYearly
                ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
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
          onSelect={() => handleCheckout("basic")}
          loading={loading === "basic"}
          disabled={currentPlan === "basic" || currentPlan === "premium"}
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
          onSelect={() => handleCheckout("premium")}
          loading={loading === "premium"}
          disabled={currentPlan === "premium"}
          highlighted
        />
      </div>

      {/* Manage Subscription Button */}
      {hasActiveSubscription && (
        <div className="mt-8 text-center">
          <button
            onClick={handleManageBilling}
            disabled={loading === "manage"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading === "manage" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            Manage Subscription
          </button>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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
      className={`relative bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden ${
        highlighted
          ? "ring-2 ring-blue-500 dark:ring-blue-400"
          : "border border-gray-200 dark:border-zinc-700"
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-1 text-sm font-medium">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Most Popular
        </div>
      )}

      <div className={`p-6 ${highlighted ? "pt-10" : ""}`}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {description}
        </p>

        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            ${price.toFixed(2)}
          </span>
          <span className="text-gray-500 dark:text-gray-400">/month</span>
          {yearlyPrice && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                ? "bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : highlighted
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900"
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
              className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
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
