/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures Sentry for the Edge runtime (middleware, edge API routes).
 * Edge runtime has limited APIs compared to Node.js, so configuration is simpler.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment detection
  environment: process.env.NODE_ENV,

  // Release tracking (set during build)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Performance Monitoring
  // Capture 10% of transactions in production for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Filter out known non-critical errors
  ignoreErrors: [
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'AbortError',
    // Rate limiting
    'Too Many Requests',
  ],

  // Debug mode (disable in production)
  debug: false,

  // Normalize error depth to reduce payload size
  normalizeDepth: 3,

  // Maximum breadcrumbs to capture (keep low for edge)
  maxBreadcrumbs: 20,

  // Before sending event, add extra context and filter
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry] Edge event captured (not sent in development):', {
        message: event.message,
        exception: hint?.originalException,
      })
      return null
    }

    // Add edge runtime context
    event.tags = {
      ...event.tags,
      runtime: 'edge',
    }

    return event
  },

  // Before sending a transaction, filter out unnecessary ones
  beforeSendTransaction(event) {
    // Skip health check transactions
    if (event.transaction?.includes('/api/health')) {
      return null
    }

    // Skip static file transactions
    if (event.transaction?.includes('/_next/')) {
      return null
    }

    return event
  },
})
