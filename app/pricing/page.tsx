export const dynamic = "force-dynamic";

/**
 * Pricing Page
 *
 * A comprehensive pricing page with:
 * - Visual plan comparison
 * - Annual billing discount (20% off)
 * - FAQ section
 * - Testimonials
 * - Money-back guarantee badge
 */

import { Metadata } from "next";
import { ArrowRight, Check, Minus, Plus, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parsePlanType, type PlanType } from "@/lib/stripe";
import { getTrialStatus } from "@/lib/trial";
import { PricingClient } from "./pricing-client";

export const metadata: Metadata = {
  title: "Pricing | Remedi",
  description:
    "Choose the perfect Remedi plan for your natural remedy journey. Free, Basic, and Premium plans available.",
};

export default async function PricingPage() {
  const user = await getCurrentUser();

  let currentPlan: PlanType = "free";
  let trialEligible = false;
  let hasActiveSubscription = false;

  if (user) {
    // Get subscription status
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { plan: true, status: true, stripeSubscriptionId: true },
    });

    if (subscription?.status === "active") {
      currentPlan = parsePlanType(subscription.plan);
    }

    hasActiveSubscription = !!subscription?.stripeSubscriptionId;

    // Check trial eligibility
    const trialStatus = await getTrialStatus(user.id);
    trialEligible = trialStatus.isEligible;
  }

  return (
    <main className="px-4 pt-14 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Hero Section */}
        <section className="pt-20 pb-12 text-center md:pt-24">
          <p className="eyebrow">Pricing</p>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold md:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Choose the plan that fits how you use Remedi. Every paid plan
            includes a 14-day money-back guarantee.
          </p>

          {/* Money-back guarantee badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            14-Day Money-Back Guarantee
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-16">
          <PricingClient
            currentPlan={currentPlan}
            hasActiveSubscription={hasActiveSubscription}
            trialEligible={trialEligible}
            isAuthenticated={!!user}
          />
        </section>

        {/* Feature Comparison Table */}
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-4xl">
            <p className="eyebrow text-center">Compare</p>
            <h2 className="mt-3 text-center text-3xl font-semibold">
              Everything in each plan
            </h2>

            <div className="mt-10 overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="eyebrow eyebrow-muted px-4 py-3 text-left">
                      Feature
                    </th>
                    <th className="eyebrow eyebrow-muted px-4 py-3 text-center">
                      Free
                    </th>
                    <th className="eyebrow eyebrow-muted px-4 py-3 text-center">
                      Basic
                    </th>
                    <th className="eyebrow bg-primary/5 px-4 py-3 text-center">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {featureComparison.map((feature) => (
                    <tr key={feature.name}>
                      <td className="px-4 py-3 text-foreground">
                        {feature.name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <FeatureValue value={feature.free} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <FeatureValue value={feature.basic} />
                      </td>
                      <td className="bg-primary/5 px-4 py-3 text-center">
                        <FeatureValue value={feature.premium} highlight />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-border py-16">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[220px_1fr] md:gap-12">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 className="mt-3 text-2xl font-semibold">
                Frequently asked questions
              </h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {faqs.map((faq) => (
                <details key={faq.question} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <Plus
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45 group-open:text-primary"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="pb-5 pr-10 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-20">
          <div className="premium-gradient-panel flex flex-col items-start gap-6 rounded-lg p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold md:text-3xl">
                Ready to look at your options?
              </h2>
              <p className="mt-2 leading-relaxed text-white/80">
                Search FDA drug data and evidence-rated natural alternatives,
                then talk it through with your healthcare provider.
              </p>
            </div>
            <a
              href="#pricing"
              className={cn(
                buttonVariants({ size: "lg" }),
                "shrink-0 bg-white text-primary hover:bg-white/90",
              )}
            >
              Get Started Today
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

// Feature value display component
function FeatureValue({
  value,
  highlight = false,
}: {
  value: string | boolean;
  highlight?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check
        className={`mx-auto h-4 w-4 ${highlight ? "text-primary" : "text-foreground"}`}
        aria-label="Included"
      />
    ) : (
      <Minus
        className="mx-auto h-4 w-4 text-muted-foreground/40"
        aria-label="Not included"
      />
    );
  }

  return (
    <span
      className={`font-mono text-xs ${
        highlight ? "font-medium text-primary" : "text-foreground"
      }`}
    >
      {value}
    </span>
  );
}

// Feature comparison data
const featureComparison = [
  { name: "Daily searches", free: "5", basic: "100", premium: "Unlimited" },
  { name: "Saved favorites", free: "3", basic: "50", premium: "Unlimited" },
  {
    name: "AI-powered searches",
    free: false,
    basic: "10/day",
    premium: "50/day",
  },
  {
    name: "Health profile",
    free: "Basic",
    basic: "Full",
    premium: "Full",
  },
  {
    name: "Medication cabinet",
    free: "3 meds",
    basic: "20 meds",
    premium: "Unlimited",
  },
  {
    name: "Auto-interaction alerts",
    free: false,
    basic: true,
    premium: true,
  },
  {
    name: "Personalized search",
    free: false,
    basic: true,
    premium: true,
  },
  {
    name: "Remedy tracking journal",
    free: false,
    basic: true,
    premium: true,
  },
  {
    name: "Effectiveness charts",
    free: false,
    basic: "Per remedy",
    premium: "Cross-remedy",
  },
  {
    name: "AI remedy reports",
    free: false,
    basic: "2/month",
    premium: "Unlimited",
  },
  {
    name: "AI-powered journal insights",
    free: false,
    basic: false,
    premium: true,
  },
  {
    name: "Weekly digest",
    free: "Generic",
    basic: "Personalized",
    premium: "Full + AI insights",
  },
  { name: "Search history", free: false, basic: true, premium: true },
  {
    name: "Compare remedies",
    free: false,
    basic: "Up to 4",
    premium: "Up to 10",
  },
  { name: "Export data", free: false, basic: true, premium: true },
  { name: "Priority support", free: false, basic: false, premium: true },
];

// Testimonials data

// FAQ data
const faqs = [
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time from your billing settings. You'll continue to have access to premium features until the end of your current billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards including Visa, Mastercard, American Express, and Discover. We also support Apple Pay and Google Pay where available.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes! New users can start a 7-day free trial of our Premium plan. No credit card required to start. Experience all premium features before you decide to subscribe.",
  },
  {
    question: "What happens when I upgrade or downgrade?",
    answer:
      "When you upgrade, you'll immediately get access to the new features. When you downgrade, your current plan continues until the end of your billing period, then switches to the new plan.",
  },
  {
    question: "How does the annual billing discount work?",
    answer:
      "When you choose annual billing, you get 20% off compared to monthly billing. This means you pay for 10 months and get 12 months of access.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 14-day money-back guarantee. If you're not satisfied with your subscription, contact us within 14 days of purchase for a full refund.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use industry-standard encryption and security practices. Your data is never sold to third parties, and you can export or delete your data at any time.",
  },
  {
    question: "Can I use Remedi for professional/commercial purposes?",
    answer:
      "Yes, our Premium plan includes commercial use rights. Many healthcare practitioners, researchers, and content creators use Remedi in their professional work.",
  },
];
