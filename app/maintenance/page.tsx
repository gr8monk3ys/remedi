import type { Metadata } from "next";
import { Wrench } from "lucide-react";
import { RefreshButton } from "./RefreshButton";

export const metadata: Metadata = {
  title: "Under Maintenance | Remedi",
  description: "Remedi is currently undergoing scheduled maintenance.",
};

/**
 * Maintenance Mode Page - Server Component
 *
 * Displayed when MAINTENANCE_MODE=true is set in environment variables.
 * Users are redirected here by the middleware. All static content is
 * server-rendered; only the refresh button requires client interactivity.
 */
export default function MaintenancePage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-14">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card">
          <Wrench className="h-5 w-5 text-warning" aria-hidden="true" />
        </div>

        <p className="eyebrow eyebrow-muted">Status</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">
          Under Maintenance
        </h1>

        <p className="mt-3 text-muted-foreground">
          We are currently performing scheduled maintenance to improve your
          experience. Please check back soon.
        </p>

        {/* Estimated Time */}
        <div className="mt-8 rounded-lg border border-border bg-card p-5">
          <p className="eyebrow eyebrow-muted">Estimated downtime</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            Less than 30 minutes
          </p>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          For status updates, follow us on social media or check our status
          page.
        </p>

        {/* Refresh Button - client component */}
        <RefreshButton />
      </div>
    </div>
  );
}
