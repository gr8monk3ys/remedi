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

  // No replay sample rates: Session Replay is not attached at all. Leaving
  // them set would be a standing instruction to record health-dashboard
  // sessions the moment anyone adds the integration back. See the note at the
  // foot of this file.

  // Integrations for browser monitoring.
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
 * Session Replay is deliberately not attached.
 *
 * It used to be, at replaysOnErrorSampleRate: 1.0 — every session that hit an
 * error, recorded and sent to a third party. The masking below it was careful
 * and correct, and it was still the wrong trade for this product.
 *
 * Remedi collects GDPR Article 9 special-category data: HealthProfile carries
 * allergies and conditions, MedicationCabinet is a person's actual medication
 * list, RemedyJournal holds symptoms, side effects, mood and sleep. Those
 * pages are exactly where an error is most likely, so a 100% on-error sample
 * targets the most sensitive sessions in the product. The privacy policy does
 * not disclose any of it, no legal basis is stated, and the cookie consent
 * that correctly gates Google Analytics never gated this.
 *
 * Masking reduces that exposure; it does not make it disclosed or consented,
 * and a masking option that regresses silently is not something to stake
 * health data on. Errors still report in full, which is the part that was
 * actually missing — until this commit the browser SDK could not send anything
 * at all, because connect-src did not list the ingest host.
 *
 * Re-enabling it is a product decision, and needs the privacy policy and the
 * consent flow updated first, not just this file.
 */
