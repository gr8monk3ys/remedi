/**
 * Sentry Client-Side Configuration
 *
 * This file configures Sentry for the client-side (browser).
 * It initializes Sentry with error tracking, performance monitoring,
 * and session replay capabilities.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment detection
  environment: process.env.NODE_ENV,

  // Release tracking (set during build)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Performance Monitoring
  // Capture 10% of transactions in production for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay
  // Capture 10% of sessions for replay in production
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  // Capture 100% of sessions with errors for replay
  replaysOnErrorSampleRate: 1.0,

  // Integrations for browser monitoring.
  //
  // Session Replay is deliberately NOT here — it is loaded lazily below, after
  // the page is interactive. Its bundle is 50-70 KB, and putting it on the
  // critical path would undo the LCP work in #140. Error reporting is the part
  // that must be present from the first millisecond; replay is diagnostic
  // colour and can arrive late.
  integrations: [
    // Browser Tracing for performance monitoring
    Sentry.browserTracingIntegration({
      // Track navigation and page load performance
      enableInp: true,
    }),
    // Feedback widget for user error reports
    Sentry.feedbackIntegration({
      colorScheme: "system",
      showBranding: false,
      formTitle: "Report an Issue",
      submitButtonLabel: "Send Report",
      successMessageText: "Thank you for your feedback!",
    }),
  ],

  // Filter out known non-critical errors to reduce noise
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:/,
    /^moz-extension:/,
    /^safari-extension:/,
    // Network errors that users cannot control
    "Failed to fetch",
    "NetworkError",
    "AbortError",
    "Load failed",
    "Network request failed",
    // ResizeObserver loop errors (benign)
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    // Script loading errors
    "ChunkLoadError",
    "Loading chunk",
    // Third-party script errors
    /^Script error\.?$/,
    // Cancelled requests
    "The operation was aborted",
    "cancelled",
  ],

  // URLs to ignore (third-party scripts)
  denyUrls: [
    // Google Analytics
    /google-analytics\.com/,
    /googletagmanager\.com/,
    // Facebook
    /connect\.facebook\.net/,
    // Browser extensions
    /extensions\//,
    /^chrome:\/\//,
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
  ],

  // Debug mode (disable in production)
  debug: false,

  // Normalize error depth to reduce payload size
  normalizeDepth: 5,

  // Maximum breadcrumbs to capture
  maxBreadcrumbs: 50,

  // Before sending event, add extra context and filter
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === "development") {
      console.warn("[Sentry] Event captured (not sent in development):", {
        message: event.message,
        exception: hint?.originalException,
      });
      return null;
    }

    // Add user context if available
    if (typeof window !== "undefined") {
      event.tags = {
        ...event.tags,
        url_path: window.location.pathname,
        user_agent: navigator.userAgent,
      };
    }

    return event;
  },

  // Before sending a transaction, filter out unnecessary ones
  beforeSendTransaction(event) {
    // Skip health check transactions
    if (event.transaction?.includes("/api/health")) {
      return null;
    }
    return event;
  },
});

/**
 * Attach Session Replay once the page has settled.
 *
 * `lazyLoadIntegration` fetches the replay bundle from the CDN rather than
 * shipping it in the initial chunk. Deferring to `load` keeps it off the
 * critical path entirely.
 *
 * The masking below is the same as before and is not optional: this product
 * renders a person's Medication Cabinet, Health Profile and Journal, so a
 * replay that captured text would be shipping health data to a third party.
 * `maskAllInputs` alone is not enough — the sensitive content here is what is
 * displayed back to someone, not only what they type. There is deliberately no
 * `networkDetailAllowUrls`; it previously included `window.location.origin`,
 * which captured our own API's request and response bodies.
 */
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const attachReplay = (): void => {
    void Sentry.lazyLoadIntegration("replayIntegration")
      .then((replayIntegration) => {
        Sentry.getClient()?.addIntegration(
          replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
            maskAllInputs: true,
          }),
        );
      })
      .catch(() => {
        // Replay is diagnostic. Failing to load it must never break the page,
        // and must never be mistaken for error reporting being down.
      });
  };

  if (document.readyState === "complete") {
    attachReplay();
  } else {
    window.addEventListener("load", attachReplay, { once: true });
  }
}
