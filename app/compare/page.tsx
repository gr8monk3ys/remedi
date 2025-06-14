import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ComparisonSkeleton } from "@/components/compare";
import { getCurrentUser } from "@/lib/auth";
import { getEffectivePlanLimits } from "@/lib/trial";
import { CompareClient } from "./CompareClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare Remedies | Remedi",
  description:
    "Compare natural remedies side by side to find the best option for your needs.",
};

/**
 * Compare page - Server Component
 *
 * Provides SEO metadata and reads searchParams on the server so the client
 * component receives pre-parsed IDs as props. The outer page shell (min-height
 * wrapper, padding, max-width container, disclaimer) is server-rendered for
 * immediate display. All interactive comparison logic (fetching, state,
 * context, routing) is delegated to CompareClient.
 */
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const user = await getCurrentUser();

  const params = await searchParams;
  const initialIds = params.ids
    ? params.ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="pt-24 pb-12 px-4 md:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-foreground">
              Compare Remedies
            </h1>
            <p className="mt-2 text-muted-foreground">
              Comparing remedies is available on paid plans. Sign in to upgrade
              and unlock side-by-side comparisons.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-in?redirect_url=/compare"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { limits } = await getEffectivePlanLimits(user.id);

  if (!limits.canCompare) {
    return (
      <div className="min-h-screen">
        <div className="pt-24 pb-12 px-4 md:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-foreground">
              Compare Remedies
            </h1>
            <p className="mt-2 text-muted-foreground">
              Upgrade to Basic or Premium to compare remedies side by side.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Upgrade
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Back to Search
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxCompareItems =
    typeof limits.maxCompareItems === "number" && limits.maxCompareItems > 0
      ? limits.maxCompareItems
      : 4;
  const trimmedInitialIds = initialIds.slice(0, maxCompareItems);
  const trimmedFromCount =
    initialIds.length > trimmedInitialIds.length ? initialIds.length : null;

  return (
    <div className="min-h-screen">
      {/* Main content */}
      <div className="pt-24 pb-12 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Interactive comparison content - client rendered with Suspense */}
          <Suspense fallback={<ComparisonSkeleton />}>
            <CompareClient
              initialIds={trimmedInitialIds}
              maxCompareItems={maxCompareItems}
              trimmedFromCount={trimmedFromCount}
            />
          </Suspense>

          {/* Disclaimer - server rendered, always visible */}
          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg print:mt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Disclaimer:</strong> This comparison is for informational
              purposes only and should not be considered medical advice. Always
              consult with a qualified healthcare professional before making
              changes to your health regimen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
