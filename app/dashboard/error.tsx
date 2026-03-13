"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Failed to load dashboard
        </h2>
        <p className="text-muted-foreground mb-6">
          We could not load your dashboard data. This may be a temporary issue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-center"
          >
            Go Home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Error Details
            </summary>
            <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
