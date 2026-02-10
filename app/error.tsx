"use client";

/**
 * Error Handler for Route Segments
 *
 * This file handles errors that occur within route segments.
 * It provides a fallback UI and error recovery.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";
import { createLogger } from "@/lib/logger";

const logger = createLogger("route-error");

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
    logger.error("Route error", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Something went wrong
        </h2>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. Please try again or return to the
          home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
