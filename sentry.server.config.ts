/**
 * Sentry Server-Side Configuration
 *
 * This file configures Sentry for the server-side (Node.js).
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

  // Enable profiling for performance monitoring
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // Filter out known non-critical errors
  ignoreErrors: [
    // Network errors
    'ECONNRESET',
    'ENOTFOUND',
    'ETIMEDOUT',
    // Prisma connection errors (retryable)
    'PrismaClientInitializationError',
  ],

  // Environment detection
  environment: process.env.NODE_ENV,

  // Release tracking (set during build)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Before sending event, add extra context
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry] Server event captured (not sent in development):', {
        message: event.message,
        exception: hint?.originalException,
      });
      return null;
    }
    return event;
  },
});
