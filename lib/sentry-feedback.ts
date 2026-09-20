/**
 * The Sentry "Report an Issue" widget, isolated so it can load after the page.
 *
 * This module exists only to be `import()`ed from sentry.client.config.ts.
 * Turbopack ignores webpack's `webpackExports` hint, so a dynamic
 * `import("@sentry/nextjs")` there emitted the SDK's entire barrel — Replay
 * included — as one 104 KiB (gzip) chunk. A named static import from a small
 * module of its own is what Turbopack can tree-shake, so the async chunk holds
 * the widget and nothing else.
 */

import { addIntegration, feedbackIntegration } from "@sentry/nextjs";

/** Attach the feedback widget to the already-initialised Sentry client. */
export function attachFeedbackWidget(): void {
  addIntegration(
    feedbackIntegration({
      colorScheme: "system",
      showBranding: false,
      formTitle: "Report an Issue",
      submitButtonLabel: "Send Report",
      successMessageText: "Thank you for your feedback!",
    }),
  );
}
