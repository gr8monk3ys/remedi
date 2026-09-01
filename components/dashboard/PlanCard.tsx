"use client";

import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/lib/stripe-config";

interface PlanCardProps {
  plan: PlanType;
  name: string;
  description: string;
  price: number;
  yearlyPrice?: number;
  features: string[];
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  interval?: "monthly" | "yearly";
  onSelect?: () => void;
  onManage?: () => void;
  actionLabel?: string;
  isLoading?: boolean;
  className?: string;
}

const planIcons: Record<PlanType, typeof Sparkles> = {
  free: Sparkles,
  basic: Zap,
  premium: Crown,
};

const planIconColors: Record<PlanType, string> = {
  free: "text-muted-foreground",
  basic: "text-primary",
  premium: "accent-text",
};

/**
 * Plan Card Component
 *
 * Displays a subscription plan with features and pricing.
 */
export function PlanCard({
  plan,
  name,
  description,
  price,
  yearlyPrice,
  features,
  isCurrentPlan = false,
  isPopular = false,
  interval = "monthly",
  onSelect,
  onManage,
  actionLabel,
  isLoading = false,
  className,
}: PlanCardProps) {
  const Icon = planIcons[plan] || Sparkles;
  const monthlyEquivalent =
    interval === "yearly" && yearlyPrice ? yearlyPrice / 12 : price;

  if (isLoading) {
    return <PlanCardSkeleton className={className} />;
  }

  const highlighted = isPopular && !isCurrentPlan;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border bg-card p-6",
        isCurrentPlan
          ? "border-primary ring-1 ring-primary"
          : highlighted
            ? "plan-premium-border"
            : "border-border",
        className,
      )}
    >
      {highlighted && (
        <span className="absolute -top-2.5 left-6 inline-flex items-center rounded-sm bg-primary px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-primary-foreground">
          Most Popular
        </span>
      )}

      {isCurrentPlan && (
        <span className="absolute -top-2.5 left-6 inline-flex items-center rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-primary">
          Current Plan
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
          <Icon
            className={cn("h-4 w-4", planIconColors[plan])}
            aria-hidden="true"
          />
        </span>
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mt-5 mb-6">
        {price === 0 ? (
          <p className="tabular text-3xl font-semibold tracking-tight text-foreground">
            Free
          </p>
        ) : (
          <>
            <p className="tabular text-3xl font-semibold tracking-tight text-foreground">
              ${monthlyEquivalent.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            {interval === "yearly" && yearlyPrice && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                ${yearlyPrice.toFixed(2)} billed annually
              </p>
            )}
          </>
        )}
      </div>

      <ul className="mb-6 space-y-2.5" role="list">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {isCurrentPlan ? (
          onManage ? (
            <button
              onClick={onManage}
              className="w-full rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Manage Subscription
            </button>
          ) : (
            <div className="w-full rounded-md bg-muted px-4 py-2 text-center text-sm font-medium text-muted-foreground">
              Current Plan
            </div>
          )
        ) : (
          <button
            onClick={onSelect}
            disabled={!onSelect}
            className={cn(
              "w-full rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              plan === "free"
                ? "border border-border bg-card text-foreground hover:bg-muted"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
              !onSelect && "cursor-not-allowed opacity-50",
            )}
          >
            {actionLabel ?? (plan === "free" ? "Downgrade" : "Upgrade")}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for plan card
 */
export function PlanCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-border bg-card p-6",
        className,
      )}
    >
      <div className="mb-4 h-8 w-8 rounded-md bg-muted" />
      <div className="mb-2 h-6 w-24 rounded bg-muted" />
      <div className="mb-4 h-4 w-32 rounded bg-muted" />
      <div className="mb-6 h-8 w-20 rounded bg-muted" />
      <div className="mb-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="h-9 w-full rounded-md bg-muted" />
    </div>
  );
}
