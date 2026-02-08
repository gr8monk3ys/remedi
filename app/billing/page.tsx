export const dynamic = "force-dynamic";

/**
 * Billing Page
 *
 * Displays subscription plans and allows users to manage their billing.
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS, type PlanType } from "@/lib/stripe";
import { BillingClient } from "./billing-client";

export const metadata: Metadata = {
  title: "Billing & Subscription | Remedi",
  description: "Manage your Remedi subscription and billing settings",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user) {
    redirect("/sign-in?redirect_url=/billing");
  }

  // Get user's subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  const currentPlan = (subscription?.plan || "free") as PlanType;
  const planDetails = PLANS[currentPlan] || PLANS.free;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Success/Cancel Messages */}
        {params.success === "true" && (
          <div className="mb-8 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium">
              Payment successful! Your subscription is now active.
            </p>
          </div>
        )}
        {params.canceled === "true" && (
          <div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              Payment was canceled. You can try again when ready.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get access to more features and unlock the full potential of Remedi.
            All plans include a 14-day money-back guarantee.
          </p>
        </div>

        {/* Current Plan Banner */}
        <div className="mb-8 p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current Plan
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {planDetails.name}
              </p>
              {subscription?.status && subscription.status !== "active" && (
                <p className="text-sm text-red-500">
                  Status: {subscription.status}
                </p>
              )}
              {subscription?.cancelAtPeriodEnd && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Cancels at period end
                </p>
              )}
            </div>
            {subscription?.currentPeriodEnd && currentPlan !== "free" && (
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Next billing date
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <BillingClient
          currentPlan={currentPlan}
          hasActiveSubscription={!!subscription?.stripeSubscriptionId}
        />

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can cancel your subscription at any time. You will
                continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards including Visa, Mastercard,
                American Express, and Discover.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We offer a 14-day money-back guarantee. If you are not
                satisfied, contact us for a full refund.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect on your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
