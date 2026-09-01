"use client";

/**
 * Pricing Plan Cards
 *
 * Renders the three-column grid of Free / Basic / Premium pricing cards.
 */

import { Check, Loader2, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanType } from "@/lib/stripe-config";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
  currentPlan: PlanType;
  isYearly: boolean;
  loading: string | null;
  trialEligible: boolean;
  onCheckout: (plan: PlanType) => void;
  onStartTrial: () => void;
  /** Opens the billing portal so a paid user can move back to Free. */
  onDowngrade: () => void;
  basicDisplayPrice: string;
  basicYearlyBilled: string;
  premiumDisplayPrice: string;
  premiumYearlyBilled: string;
}

export function PricingCards({
  currentPlan,
  isYearly,
  loading,
  trialEligible,
  onCheckout,
  onStartTrial,
  onDowngrade,
  basicDisplayPrice,
  basicYearlyBilled,
  premiumDisplayPrice,
  premiumYearlyBilled,
}: PricingCardsProps) {
  const showTrial = trialEligible && currentPlan === "free";

  return (
    <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
      {/* Free Plan */}
      <PlanShell
        icon={Zap}
        name={PLANS.free.name}
        description={PLANS.free.description}
        price="$0"
        className="reveal-up"
        features={PLANS.free.features}
        action={
          <Button
            variant="outline"
            className="w-full"
            onClick={currentPlan === "free" ? undefined : onDowngrade}
            disabled={currentPlan === "free" || loading === "free"}
          >
            {currentPlan === "free" ? "Current Plan" : "Downgrade"}
          </Button>
        }
      />

      {/* Basic Plan */}
      <PlanShell
        icon={Sparkles}
        name={PLANS.basic.name}
        description={PLANS.basic.description}
        price={`$${basicDisplayPrice}`}
        billedNote={isYearly ? `Billed $${basicYearlyBilled}/year` : undefined}
        className="reveal-up reveal-delay-1"
        features={PLANS.basic.features}
        action={
          <Button
            className="w-full"
            variant={currentPlan === "basic" ? "tonal" : "default"}
            onClick={() => onCheckout("basic")}
            disabled={
              loading === "basic" ||
              currentPlan === "basic" ||
              currentPlan === "premium"
            }
          >
            {loading === "basic" ? (
              <Loader2 className="animate-spin" />
            ) : currentPlan === "basic" ? (
              <>
                <Check />
                Current Plan
              </>
            ) : currentPlan === "premium" ? (
              "Included"
            ) : (
              "Get Started"
            )}
          </Button>
        }
      />

      {/* Premium Plan */}
      <PlanShell
        icon={Crown}
        name={PLANS.premium.name}
        description={PLANS.premium.description}
        price={`$${premiumDisplayPrice}`}
        billedNote={
          isYearly ? `Billed $${premiumYearlyBilled}/year` : undefined
        }
        className="reveal-up reveal-delay-2"
        highlighted
        features={PLANS.premium.features}
        action={
          <div className="space-y-2">
            {showTrial && (
              <Button
                className="w-full"
                onClick={onStartTrial}
                disabled={loading === "trial"}
              >
                {loading === "trial" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Sparkles />
                    Start 7-Day Free Trial
                  </>
                )}
              </Button>
            )}
            <Button
              className="w-full"
              variant={
                currentPlan === "premium"
                  ? "tonal"
                  : showTrial
                    ? "outline"
                    : "default"
              }
              onClick={() => onCheckout("premium")}
              disabled={loading === "premium" || currentPlan === "premium"}
            >
              {loading === "premium" ? (
                <Loader2 className="animate-spin" />
              ) : currentPlan === "premium" ? (
                <>
                  <Check />
                  Current Plan
                </>
              ) : showTrial ? (
                "Subscribe Now"
              ) : (
                "Upgrade to Premium"
              )}
            </Button>
          </div>
        }
      />
    </div>
  );
}

function PlanShell({
  icon: Icon,
  name,
  description,
  price,
  billedNote,
  features,
  action,
  highlighted = false,
  className,
}: {
  icon: typeof Zap;
  name: string;
  description: string;
  price: string;
  billedNote?: string;
  features: readonly string[];
  action: React.ReactNode;
  highlighted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border bg-card p-6",
        highlighted ? "border-primary ring-1 ring-primary" : "border-border",
        className,
      )}
    >
      {highlighted && (
        <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-sm bg-primary px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-primary-foreground">
          <Crown className="h-3 w-3" aria-hidden="true" />
          Most Popular
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        </span>
        <h3 className="text-lg font-semibold">{name}</h3>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mt-5">
        <div className="flex items-baseline gap-1">
          <span className="tabular text-4xl font-semibold tracking-tight">
            {price}
          </span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>
        {billedNote && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {billedNote}
          </p>
        )}
      </div>

      <div className="mt-6">{action}</div>

      <ul className="mt-6 space-y-3 border-t border-border pt-6">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-muted-foreground"
          >
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
