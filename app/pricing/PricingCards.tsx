"use client";

/**
 * Pricing Plan Cards
 *
 * Renders the three-column grid of Free / Basic / Premium pricing cards.
 */

import { motion } from "framer-motion";
import { Check, Loader2, Sparkles, Zap, Crown } from "lucide-react";
import { PLANS, type PlanType } from "@/lib/stripe-config";

interface PricingCardsProps {
  currentPlan: PlanType;
  isYearly: boolean;
  loading: string | null;
  trialEligible: boolean;
  onCheckout: (plan: PlanType) => void;
  onStartTrial: () => void;
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
  basicDisplayPrice,
  basicYearlyBilled,
  premiumDisplayPrice,
  premiumYearlyBilled,
}: PricingCardsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Free Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-card rounded-2xl shadow-lg overflow-hidden border border-border"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-muted rounded-lg">
              <Zap className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {PLANS.free.name}
            </h3>
          </div>

          <p className="text-muted-foreground mb-6">{PLANS.free.description}</p>

          <div className="mb-6">
            <span className="text-4xl font-bold text-foreground">$0</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <button
            disabled={currentPlan === "free"}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              currentPlan === "free"
                ? "bg-muted text-muted-foreground cursor-default"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            {currentPlan === "free" ? "Current Plan" : "Downgrade"}
          </button>

          <FeatureList
            features={PLANS.free.features}
            checkClass="text-muted-foreground"
          />
        </div>
      </motion.div>

      {/* Basic Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative bg-card rounded-2xl shadow-lg overflow-hidden border border-border"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {PLANS.basic.name}
            </h3>
          </div>

          <p className="text-muted-foreground mb-6">
            {PLANS.basic.description}
          </p>

          <div className="mb-6">
            <span className="text-4xl font-bold text-foreground">
              ${basicDisplayPrice}
            </span>
            <span className="text-muted-foreground">/month</span>
            {isYearly && (
              <p className="text-sm text-muted-foreground mt-1">
                Billed ${basicYearlyBilled}/year
              </p>
            )}
          </div>

          <button
            onClick={() => onCheckout("basic")}
            disabled={
              loading === "basic" ||
              currentPlan === "basic" ||
              currentPlan === "premium"
            }
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              currentPlan === "basic"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default"
                : currentPlan === "premium"
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
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

          <FeatureList
            features={PLANS.basic.features}
            checkClass="text-primary"
          />
        </div>
      </motion.div>

      {/* Premium Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl border-2 border-primary bg-card shadow-xl"
      >
        {/* Popular badge */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[color-mix(in_srgb,var(--primary-dark)_82%,black)] to-[color-mix(in_srgb,var(--accent-dark)_75%,black)] py-2 text-center text-sm font-medium text-white">
          <Crown className="w-4 h-4 inline mr-1" />
          Most Popular
        </div>

        <div className="p-8 pt-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-accent/35 p-2">
              <Crown className="w-6 h-6 text-[var(--accent-dark)]" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {PLANS.premium.name}
            </h3>
          </div>

          <p className="text-muted-foreground mb-6">
            {PLANS.premium.description}
          </p>

          <div className="mb-6">
            <span className="text-4xl font-bold text-foreground">
              ${premiumDisplayPrice}
            </span>
            <span className="text-muted-foreground">/month</span>
            {isYearly && (
              <p className="text-sm text-muted-foreground mt-1">
                Billed ${premiumYearlyBilled}/year
              </p>
            )}
          </div>

          {/* Trial CTA for eligible users */}
          {trialEligible && currentPlan === "free" && (
            <button
              onClick={onStartTrial}
              disabled={loading === "trial"}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[color-mix(in_srgb,var(--primary-dark)_82%,black)] to-[color-mix(in_srgb,var(--accent-dark)_75%,black)] px-4 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
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
            onClick={() => onCheckout("premium")}
            disabled={loading === "premium" || currentPlan === "premium"}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              currentPlan === "premium"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default"
                : "bg-primary text-white hover:bg-primary-light"
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

          <FeatureList
            features={PLANS.premium.features}
            checkClass="text-[var(--accent-dark)]"
          />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureList({
  features,
  checkClass,
}: {
  features: readonly string[];
  checkClass: string;
}) {
  return (
    <ul className="mt-8 space-y-4">
      {features.map((feature) => (
        <li
          key={feature}
          className="flex items-start gap-3 text-sm text-muted-foreground"
        >
          <Check className={`w-5 h-5 ${checkClass} flex-shrink-0 mt-0.5`} />
          {feature}
        </li>
      ))}
    </ul>
  );
}
