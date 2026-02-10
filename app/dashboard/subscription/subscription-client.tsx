"use client";

import { useState } from "react";
import { CreditCard, Loader2, Crown, Zap, Sparkles, Check } from "lucide-react";
import { PLANS } from "@/lib/stripe-config";
import { UsageProgressList } from "@/components/dashboard/UsageProgress";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { fetchWithCSRF } from "@/lib/fetch";
import type { PlanType } from "@/lib/stripe-config";
import type { UsageData } from "@/types/dashboard";

interface SubscriptionClientProps {
  currentPlan: PlanType;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasActiveSubscription: boolean;
  usage: {
    favorites: { current: number; limit: number };
    searches: { current: number; limit: number };
    aiSearches: { current: number; limit: number };
  };
}

const planIcons: Record<PlanType, typeof Sparkles> = {
  free: Sparkles,
  basic: Zap,
  premium: Crown,
};

const statusLabels: Record<string, { text: string; className: string }> = {
  active: {
    text: "Active",
    className:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  },
  cancelled: {
    text: "Cancelled",
    className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  },
  expired: {
    text: "Expired",
    className: "bg-muted text-muted-foreground",
  },
  suspended: {
    text: "Suspended",
    className:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  },
};

/**
 * Subscription Client Component
 *
 * Renders the subscription dashboard with current plan details,
 * usage progress bars, plan comparison cards, and billing management.
 */
export function SubscriptionClient({
  currentPlan,
  subscriptionStatus,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  hasActiveSubscription,
  usage,
}: SubscriptionClientProps): React.JSX.Element {
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  const planConfig = PLANS[currentPlan];
  const PlanIcon = planIcons[currentPlan];
  const status = subscriptionStatus
    ? (statusLabels[subscriptionStatus] ?? statusLabels.expired)
    : null;

  const formattedPeriodEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const usageData: UsageData[] = [
    {
      current: usage.favorites.current,
      limit: usage.favorites.limit,
      label: "Favorites",
    },
    {
      current: usage.searches.current,
      limit: usage.searches.limit,
      label: "Searches Today",
    },
    {
      current: usage.aiSearches.current,
      limit: usage.aiSearches.limit,
      label: "AI Searches",
    },
  ];

  const handleManageBilling = async (): Promise<void> => {
    setIsBillingLoading(true);
    setBillingError(null);

    try {
      const response = await fetchWithCSRF("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to open billing portal");
      }

      const data = (await response.json()) as { url: string };

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setBillingError(
        "Unable to open the billing portal. Please try again later.",
      );
    } finally {
      setIsBillingLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Plan Banner */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <PlanIcon className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">
                  {planConfig.name} Plan
                </h2>
                {status && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                  >
                    {status.text}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {planConfig.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1">
            {planConfig.price > 0 ? (
              <p className="text-2xl font-bold text-foreground">
                ${planConfig.price.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
            ) : (
              <p className="text-2xl font-bold text-foreground">Free</p>
            )}
            {formattedPeriodEnd && (
              <p className="text-xs text-muted-foreground">
                {cancelAtPeriodEnd
                  ? `Cancels on ${formattedPeriodEnd}`
                  : `Renews on ${formattedPeriodEnd}`}
              </p>
            )}
          </div>
        </div>

        {cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Your subscription is set to cancel at the end of the current
              billing period. You will retain access until {formattedPeriodEnd}.
            </p>
          </div>
        )}
      </div>

      {/* Usage Progress */}
      <UsageProgressList usages={usageData} title="Current Usage" />

      {/* Plan Comparison */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Available Plans
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(PLANS) as PlanType[]).map((planKey) => {
            const plan = PLANS[planKey];
            return (
              <PlanCard
                key={planKey}
                plan={planKey}
                name={plan.name}
                description={plan.description}
                price={plan.price}
                yearlyPrice={
                  "yearlyPrice" in plan ? plan.yearlyPrice : undefined
                }
                features={[...plan.features]}
                isCurrentPlan={planKey === currentPlan}
                isPopular={planKey === "basic"}
                onManage={
                  planKey === currentPlan && hasActiveSubscription
                    ? handleManageBilling
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {/* Manage Billing Section */}
      {hasActiveSubscription && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Billing</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your payment method, view invoices, or cancel your
                subscription.
              </p>
            </div>
            <button
              onClick={handleManageBilling}
              disabled={isBillingLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBillingLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CreditCard className="h-4 w-4" aria-hidden="true" />
              )}
              {isBillingLoading ? "Opening..." : "Manage Billing"}
            </button>
          </div>

          {billingError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {billingError}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plan Features Summary for Free Users */}
      {currentPlan === "free" && (
        <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 rounded-xl border border-primary/20 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <Crown className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Unlock More with a Paid Plan
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Get more searches, AI-powered recommendations, and unlimited
                favorites by upgrading your plan.
              </p>
              <ul className="space-y-2" role="list">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check
                    className="h-4 w-4 text-green-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                  AI-powered natural remedy matching
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check
                    className="h-4 w-4 text-green-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                  Unlimited favorites and full search history
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check
                    className="h-4 w-4 text-green-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                  Compare remedies side by side
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check
                    className="h-4 w-4 text-green-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                  Export your data in CSV or JSON
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
