"use client";

/**
 * Global Error Handler
 *
 * This file handles errors that occur at the root layout level.
 * It wraps the entire application and provides a fallback UI.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

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
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Oops!</h1>
            <h2 className="text-xl font-semibold text-muted-foreground mb-4">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-8">
              We apologize for the inconvenience. Our team has been notified and
              is working on fixing this issue.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            {error.digest && (
              <p className="mt-4 text-sm text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
