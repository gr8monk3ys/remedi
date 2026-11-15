/**
 * Browser access to Sentry, loaded off the critical path.
 *
 * The SDK used to be statically imported by instrumentation-client.ts and
 * every error.tsx, which put it in the JavaScript every page downloads and
 * evaluates before it is interactive. It is now fetched once the browser is
 * idle (instrumentation-client.ts), or earlier if an error boundary needs it.
 * Errors thrown before it arrives are not reported: a deliberate trade for
 * page speed.
 *
 * The import targets sentry.client.config.ts, whose named imports Turbopack
 * can tree-shake; `import("@sentry/nextjs")` would emit the SDK's whole
 * barrel, Replay included (see lib/sentry-feedback.ts).
 */

import { sentryEnabled } from "./sentry-gate";

type SentryClient = typeof import("../sentry.client.config");

let client: Promise<SentryClient> | null = null;

/** The initialised SDK, or null where Sentry is gated off (local builds). */
export function loadSentry(): Promise<SentryClient> | null {
  if (!sentryEnabled(process.env.NEXT_PUBLIC_SENTRY_DSN)) return null;
  client ??= import("../sentry.client.config");
  return client;
}

export function captureException(error: unknown): void {
  void loadSentry()?.then((sentry) => sentry.captureException(error));
}
