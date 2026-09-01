"use client";

/**
 * Global Error Handler
 *
 * This file handles errors that occur at the root layout level.
 * It wraps the entire application and provides a fallback UI. Because it
 * replaces the root layout, it has to import the stylesheet itself.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
          <div className="max-w-md text-center">
            <p className="eyebrow eyebrow-muted">Error</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="mt-3 text-muted-foreground">
              We apologize for the inconvenience. Our team has been notified and
              is working on fixing this issue.
            </p>
            <button
              onClick={reset}
              className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try Again
            </button>
            {error.digest && (
              <p className="mt-6 font-mono text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
