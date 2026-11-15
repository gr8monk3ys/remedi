/**
 * Browser instrumentation.
 *
 * Next runs this file before the app hydrates. It no longer imports the Sentry
 * SDK: that is loaded once the browser is idle, through lib/sentry-client.ts,
 * so it stays out of the JavaScript every page needs before it is interactive.
 */

import type { captureRouterTransitionStart } from "@sentry/nextjs";

import { loadSentry } from "./lib/sentry-client";

type SentryClient = Awaited<NonNullable<ReturnType<typeof loadSentry>>>;

let sentry: SentryClient | null = null;

if (typeof window !== "undefined") {
  const load = (): void => {
    void loadSentry()?.then((loaded) => {
      sentry = loaded;
    });
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(load, { timeout: 2000 });
  } else {
    // Safari has no requestIdleCallback.
    setTimeout(load, 0);
  }
}

/**
 * Report client-side navigations so traces are not truncated at the route.
 * Navigations before the SDK has loaded are not traced.
 */
export const onRouterTransitionStart: typeof captureRouterTransitionStart = (
  ...args
) => {
  sentry?.captureRouterTransitionStart(...args);
};
