import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/stripe-config";
import { isStripeConfigured, listCustomerInvoices } from "@/lib/stripe";
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
      customerId: true,
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

  let invoices: Array<{
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
  }> = [];

  if (
    hasActiveSubscription &&
    subscription?.customerId &&
    isStripeConfigured()
  ) {
    try {
      const raw = await listCustomerInvoices(subscription.customerId, {
        limit: 6,
      });
      invoices = raw.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        currency: inv.currency,
        amountDue: inv.amountDue,
        amountPaid: inv.amountPaid,
        createdAt: new Date(inv.created * 1000).toISOString(),
        hostedInvoiceUrl: inv.hostedInvoiceUrl,
        invoicePdf: inv.invoicePdf,
        periodStart: inv.periodStart
          ? new Date(inv.periodStart * 1000).toISOString()
          : null,
        periodEnd: inv.periodEnd
          ? new Date(inv.periodEnd * 1000).toISOString()
          : null,
      }));
    } catch {
      invoices = [];
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
        <p className="text-muted-foreground mt-1">
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
        invoices={invoices}
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
