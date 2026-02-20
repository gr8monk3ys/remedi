"use client";

import { useState } from "react";
import { CreditCard, Loader2, Crown, Zap, Sparkles, Check } from "lucide-react";
import { PLANS } from "@/lib/stripe-config";
import { UsageProgressList } from "@/components/dashboard/UsageProgress";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { fetchWithCSRF } from "@/lib/fetch";
import type { PlanType } from "@/lib/stripe-config";
import type { UsageData } from "@/types/dashboard";

type InvoiceSummary = {
  id: string;
  number: string | null;
  status: string | null;
  currency: string;
  amountDue: number;
  amountPaid: number;
  createdAt: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  periodStart: string | null;
  periodEnd: string | null;
};

interface SubscriptionClientProps {
  currentPlan: PlanType;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasActiveSubscription: boolean;
  invoices: InvoiceSummary[];
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
  invoices,
  usage,
}: SubscriptionClientProps): React.JSX.Element {
  const [loadingAction, setLoadingAction] = useState<
    PlanType | "manage" | null
  >(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);

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

  const planRank: Record<PlanType, number> = {
    free: 0,
    basic: 1,
    premium: 2,
  };

  const actionLabelForPlan = (targetPlan: PlanType): string | undefined => {
    if (targetPlan === currentPlan) return undefined;

    const targetRank = planRank[targetPlan];
    const currentRank = planRank[currentPlan];

    if (targetRank > currentRank) return "Upgrade";
    if (targetRank < currentRank) return "Downgrade";
    return "Change Plan";
  };

  const formatMoney = (cents: number, currency: string): string => {
    const normalizedCurrency = currency.toUpperCase();
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: normalizedCurrency,
      }).format(cents / 100);
    } catch {
      return `$${(cents / 100).toFixed(2)}`;
    }
  };

  const handleManageBilling = async (): Promise<void> => {
    if (loadingAction) return;

    setLoadingAction("manage");
    setBillingError(null);

    try {
      const response = await fetchWithCSRF("/api/billing-portal", {
        method: "POST",
      });

      const data = (await response.json()) as
        | {
            success: true;
            data: { url: string };
          }
        | {
            success: false;
            error?: { message?: string };
          };

      if (response.ok && data.success && data.data.url) {
        window.location.href = data.data.url;
        return;
      }

      setBillingError(
        (!data.success && data.error?.message) ||
          "Unable to open the billing portal. Please try again later.",
      );
    } catch {
      setBillingError(
        "Unable to open the billing portal. Please try again later.",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCheckout = async (plan: "basic" | "premium"): Promise<void> => {
    if (loadingAction) return;

    setLoadingAction(plan);
    setBillingError(null);

    try {
      const response = await fetchWithCSRF("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          interval: isYearly ? "year" : "month",
          source: "dashboard_subscription",
        }),
      });

      const data = (await response.json()) as
        | {
            success: true;
            data: { url: string };
          }
        | {
            success: false;
            error?: { message?: string };
          };

      if (response.ok && data.success && data.data.url) {
        window.location.href = data.data.url;
        return;
      }

      setBillingError(
        (!data.success && data.error?.message) ||
          "Failed to start checkout. Please try again later.",
      );
    } catch {
      setBillingError("Failed to start checkout. Please try again later.");
    } finally {
      setLoadingAction(null);
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
        <div className="flex justify-center mb-6">
          <div className="bg-muted p-1 rounded-lg inline-flex">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isYearly
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isYearly
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly{" "}
              <span className="ml-1 text-green-600 dark:text-green-400 text-xs font-semibold">
                Save 17%
              </span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(PLANS) as PlanType[]).map((planKey) => {
            const plan = PLANS[planKey];
            const onSelect =
              planKey === currentPlan
                ? undefined
                : hasActiveSubscription
                  ? handleManageBilling
                  : planKey === "basic" || planKey === "premium"
                    ? () => void handleCheckout(planKey)
                    : undefined;

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
                interval={isYearly ? "yearly" : "monthly"}
                features={[...plan.features]}
                isCurrentPlan={planKey === currentPlan}
                isPopular={planKey === "basic"}
                actionLabel={actionLabelForPlan(planKey)}
                onSelect={onSelect}
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
                Change plans, download invoices, or cancel in the Stripe billing
                portal.
              </p>
            </div>
            <button
              onClick={handleManageBilling}
              disabled={loadingAction !== null}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAction === "manage" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CreditCard className="h-4 w-4" aria-hidden="true" />
              )}
              {loadingAction === "manage" ? "Opening..." : "Manage Billing"}
            </button>
          </div>

          {billingError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {billingError}
              </p>
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-foreground">
              Recent Invoices
            </h4>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">
                No invoices found yet.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {invoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {invoice.number
                          ? `Invoice ${invoice.number}`
                          : "Invoice"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                        {invoice.periodStart && invoice.periodEnd
                          ? ` • ${new Date(invoice.periodStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${new Date(invoice.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {formatMoney(
                          invoice.amountPaid || invoice.amountDue,
                          invoice.currency,
                        )}
                      </span>
                      {invoice.status && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {invoice.status}
                        </span>
                      )}
                      {invoice.hostedInvoiceUrl && (
                        <a
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          View
                        </a>
                      )}
                      {invoice.invoicePdf && (
                        <a
                          href={invoice.invoicePdf}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          PDF
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Plan Features Summary for Free Users */}
      {currentPlan === "free" && (
        <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-[color-mix(in_srgb,var(--accent-dark)_18%,transparent)] p-6 dark:from-primary/10 dark:to-[color-mix(in_srgb,var(--accent-dark)_28%,transparent)]">
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
