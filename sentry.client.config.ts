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

  // Integrations for browser monitoring
  integrations: [
    // Session Replay for debugging user sessions
    Sentry.replayIntegration({
      // Mask sensitive text content
      maskAllText: false,
      // Block media to reduce payload size
      blockAllMedia: false,
      // Mask all inputs for privacy
      maskAllInputs: true,
      // Network request/response capture
      networkDetailAllowUrls: [
        window.location.origin,
        /^https:\/\/api\.openai\.com/,
        /^https:\/\/api\.openfda\.gov/,
      ],
    }),
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
