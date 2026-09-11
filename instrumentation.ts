/**
 * Server and edge runtime instrumentation.
 *
 * Sentry v9+ loads its server SDK from this file's `register()` hook. The
 * project had sentry.server.config.ts and sentry.edge.config.ts — the v8
 * filenames — and nothing that imported them, so `Sentry.init` never ran on
 * either runtime. There was no error monitoring in production at all: a
 * failing route logged to stdout and nothing else.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Report errors thrown inside React Server Components and route handlers.
 *
 * Without this, server-side exceptions never reach Sentry even once the SDK
 * is initialised — Next.js only surfaces them through this hook.
 */
export { captureRequestError as onRequestError } from "@sentry/nextjs";
