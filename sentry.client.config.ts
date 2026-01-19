/**
 * Sentry Client-Side Configuration
 *
 * This file configures Sentry for the client-side (browser).
 * It initializes Sentry with error tracking and performance monitoring.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Enable Replay to capture session recordings
  replaysOnErrorSampleRate: 1.0,

  // Capture Replay for 10% of all sessions
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // Integrate with Next.js
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Filter out known non-critical errors
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:/,
    /^moz-extension:/,
    // Network errors that users can't control
    'Failed to fetch',
    'NetworkError',
    'AbortError',
    // ResizeObserver loop limit exceeded (benign)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],

  // Environment detection
  environment: process.env.NODE_ENV,

  // Release tracking (set during build)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Before sending event, add extra context
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry] Event captured (not sent in development):', event);
      return null;
    }
    return event;
  },
});
