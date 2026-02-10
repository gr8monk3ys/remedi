import { Suspense } from "react";
import type { Metadata } from "next";
import { ComparisonSkeleton } from "@/components/compare";
import { CompareClient } from "./CompareClient";

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
  const params = await searchParams;
  const initialIds = params.ids
    ? params.ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen">
      {/* Main content */}
      <div className="pt-24 pb-12 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Interactive comparison content - client rendered with Suspense */}
          <Suspense fallback={<ComparisonSkeleton />}>
            <CompareClient initialIds={initialIds} />
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
