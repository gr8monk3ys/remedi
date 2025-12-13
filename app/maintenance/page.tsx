import type { Metadata } from "next";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <div className="max-w-md w-full text-center">
        {/* Maintenance Icon */}
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Under Maintenance
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8">
          We are currently performing scheduled maintenance to improve your
          experience. Please check back soon.
        </p>

        {/* Estimated Time */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            Estimated downtime
          </p>
          <p className="text-2xl font-semibold text-foreground">
            Less than 30 minutes
          </p>
        </div>

        {/* Status Updates */}
        <div className="text-sm text-muted-foreground">
          <p>
            For status updates, follow us on social media or check our status
            page.
          </p>
        </div>

        {/* Refresh Button - client component */}
        <RefreshButton />
      </div>
    </div>
  );
}
