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

const planColors: Record<PlanType, string> = {
  free: "border-border",
  basic: "border-primary/30 dark:border-primary/50",
  premium:
    "border-[color:color-mix(in_srgb,var(--accent-dark)_45%,transparent)] dark:border-[color:color-mix(in_srgb,var(--accent-light)_50%,transparent)]",
};

const planBgColors: Record<PlanType, string> = {
  free: "bg-muted",
  basic: "bg-primary/10 dark:bg-primary/20",
  premium:
    "bg-[color:color-mix(in_srgb,var(--accent-dark)_14%,white)] dark:bg-[color:color-mix(in_srgb,var(--accent-dark)_24%,black)]",
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

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 p-6 transition-all",
        planColors[plan],
        isCurrentPlan &&
          "ring-2 ring-primary ring-offset-2 dark:ring-offset-background",
        isPopular && !isCurrentPlan && "shadow-lg",
        className,
      )}
    >
      {isPopular && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
            Current Plan
          </span>
        </div>
      )}

      <div className={cn("rounded-lg p-3 w-fit mb-4", planBgColors[plan])}>
        <Icon
          className={cn(
            "h-6 w-6",
            plan === "free" && "text-muted-foreground",
            plan === "basic" && "text-primary",
            plan === "premium" &&
              "text-[var(--accent-dark)] dark:text-[var(--accent-light)]",
          )}
        />
      </div>

      <h3 className="text-xl font-bold text-foreground">{name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>

      <div className="mt-4 mb-6">
        {price === 0 ? (
          <p className="text-3xl font-bold text-foreground">Free</p>
        ) : (
          <>
            <p className="text-3xl font-bold text-foreground">
              ${monthlyEquivalent.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            {interval === "yearly" && yearlyPrice && (
              <p className="text-sm text-muted-foreground">
                ${yearlyPrice.toFixed(2)} billed annually
              </p>
            )}
          </>
        )}
      </div>

      <ul className="space-y-3 mb-6" role="list">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check
              className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        onManage ? (
          <button
            onClick={onManage}
            className="w-full py-2.5 px-4 rounded-lg border-2 border-border text-foreground font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Manage Subscription
          </button>
        ) : (
          <div className="w-full py-2.5 px-4 rounded-lg bg-muted text-muted-foreground text-center font-medium">
            Current Plan
          </div>
        )
      ) : (
        <button
          onClick={onSelect}
          disabled={!onSelect}
          className={cn(
            "w-full py-2.5 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            plan === "free"
              ? "bg-muted text-foreground hover:bg-muted"
              : "bg-primary text-white hover:bg-primary/90",
            !onSelect && "opacity-50 cursor-not-allowed",
          )}
        >
          {actionLabel ?? (plan === "free" ? "Downgrade" : "Upgrade")}
        </button>
      )}
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
        "rounded-xl border-2 border-border p-6 animate-pulse",
        className,
      )}
    >
      <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
      <div className="h-6 w-24 bg-muted rounded mb-2" />
      <div className="h-4 w-32 bg-muted rounded mb-4" />
      <div className="h-8 w-20 bg-muted rounded mb-6" />
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="h-10 w-full bg-muted rounded-lg" />
    </div>
  );
}
