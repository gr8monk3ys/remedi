import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { parsePlanType, type PlanType } from "@/lib/stripe";
import type { Metadata } from "next";
import { createLogger } from "@/lib/logger";

const logger = createLogger("dashboard");
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Dashboard | Remedi",
  },
  description:
    "Manage your Remedi account, view search history, and access saved remedies.",
  robots: "noindex, nofollow",
};

/**
 * Dashboard Layout
 *
 * Provides the layout for all dashboard pages with sidebar navigation.
 * Protected route - redirects to sign in if not authenticated.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Redirect to sign in if not authenticated
  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  // Get user's subscription plan
  let currentPlan: PlanType = "free";

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { plan: true, status: true },
    });

    if (subscription && subscription.status === "active") {
      currentPlan = parsePlanType(subscription.plan);
    }
  } catch (error) {
    logger.error("Error fetching subscription", error);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={user} currentPlan={currentPlan} />

      <main className="min-h-screen min-w-0 flex-1">
        <div className="p-4 pt-16 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
