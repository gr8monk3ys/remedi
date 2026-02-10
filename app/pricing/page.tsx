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
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your natural wellness journey. All plans
            include a 14-day money-back guarantee.
          </p>

          {/* Money-back guarantee badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            14-Day Money-Back Guarantee
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <PricingClient
            currentPlan={currentPlan}
            hasActiveSubscription={hasActiveSubscription}
            trialEligible={trialEligible}
            isAuthenticated={!!user}
          />
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Compare All Features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">
                    Free
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">
                    Basic
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={`border-b border-border ${
                      index % 2 === 0 ? "bg-muted/50" : ""
                    }`}
                  >
                    <td className="py-4 px-4 text-foreground">
                      {feature.name}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <FeatureValue value={feature.free} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <FeatureValue value={feature.basic} />
                    </td>
                    <td className="py-4 px-4 text-center bg-blue-50/50 dark:bg-blue-900/10">
                      <FeatureValue value={feature.premium} highlight />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            What Our Users Say
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-muted rounded-lg">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Your Natural Wellness Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users discovering natural alternatives with
            Remedi.
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-lg transition-colors"
          >
            Get Started Today
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </section>
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
      <svg
        className={`w-5 h-5 mx-auto ${highlight ? "text-blue-500" : "text-green-500"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ) : (
      <span className="text-muted-foreground">-</span>
    );
  }

  return (
    <span
      className={`${
        highlight
          ? "text-blue-600 dark:text-blue-400 font-medium"
          : "text-foreground"
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
const testimonials = [
  {
    name: "Sarah M.",
    title: "Health Enthusiast",
    quote:
      "Remedi has completely changed how I approach natural wellness. The AI-powered search is incredibly helpful for finding the right remedies.",
  },
  {
    name: "David L.",
    title: "Naturopath",
    quote:
      "As a practitioner, I use Remedi daily to research natural alternatives for my clients. The Premium plan is absolutely worth it.",
  },
  {
    name: "Emily R.",
    title: "Wellness Blogger",
    quote:
      "The comparison feature is a game-changer. I can easily compare multiple remedies and make informed recommendations to my readers.",
  },
];

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
