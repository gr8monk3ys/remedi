import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/stripe-config";
import { SubscriptionClient } from "./subscription-client";
import type { PlanType } from "@/lib/stripe-config";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscription",
  description: "Manage your subscription plan and view usage on Remedi.",
};

/**
 * Subscription Dashboard Page
 *
 * Displays the user's current plan, usage statistics, and plan comparison.
 * Fetches subscription and usage data server-side for fast initial render.
 */
export default async function SubscriptionPage(): Promise<React.JSX.Element | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      plan: true,
      status: true,
      interval: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
    },
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [favoritesCount, searchesToday] = await Promise.all([
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.searchHistory.count({
      where: {
        userId: user.id,
        createdAt: { gte: startOfDay },
      },
    }),
  ]);

  const currentPlan: PlanType = subscription?.plan ?? "free";
  const planConfig = PLANS[currentPlan];
  const hasActiveSubscription =
    !!subscription &&
    subscription.status === "active" &&
    currentPlan !== "free";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Subscription
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your plan, view usage, and explore available upgrades.
        </p>
      </div>

      {/* Subscription Content */}
      <SubscriptionClient
        currentPlan={currentPlan}
        subscriptionStatus={subscription?.status ?? null}
        currentPeriodEnd={subscription?.currentPeriodEnd?.toISOString() ?? null}
        cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd ?? false}
        hasActiveSubscription={hasActiveSubscription}
        usage={{
          favorites: {
            current: favoritesCount,
            limit: planConfig.limits.favorites,
          },
          searches: {
            current: searchesToday,
            limit: planConfig.limits.searchesPerDay,
          },
          aiSearches: {
            current: 0,
            limit: planConfig.limits.aiSearches,
          },
        }}
      />
    </div>
  );
}
