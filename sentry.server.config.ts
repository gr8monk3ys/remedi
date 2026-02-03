/**
 * Sentry Server-Side Configuration
 *
 * This file configures Sentry for the server-side (Node.js).
 * It initializes Sentry with error tracking, performance monitoring,
 * and database query tracing.
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

  // Profiling for performance analysis
  // Profile 10% of sampled transactions in production
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // Integrations for server monitoring
  integrations: [
    // Prisma integration for database query tracing
    Sentry.prismaIntegration(),
    // HTTP integration for outgoing request tracing
    Sentry.httpIntegration(),
    // Node.js native fetch integration
    Sentry.nativeNodeFetchIntegration(),
  ],

  // Filter out known non-critical errors to reduce noise
  ignoreErrors: [
    // Network errors (often transient)
    'ECONNRESET',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EPIPE',
    'EAI_AGAIN',
    // Prisma connection errors (retryable)
    'PrismaClientInitializationError',
    'PrismaClientRustPanicError',
    // Request cancellation
    'AbortError',
    'The operation was aborted',
    // Rate limiting (expected behavior)
    'Too Many Requests',
    // Health check failures (handled by monitoring)
    'Health check failed',
  ],

  // Debug mode (disable in production)
  debug: false,

  // Normalize error depth to reduce payload size
  normalizeDepth: 5,

  // Maximum breadcrumbs to capture
  maxBreadcrumbs: 50,

  // Use traces sampler for more control over what gets sampled
  tracesSampler: (samplingContext) => {
    // Always sample errors
    if (samplingContext.parentSampled !== undefined) {
      return samplingContext.parentSampled
    }

    // Skip health check endpoints
    const url = samplingContext.transactionContext?.name || ''
    if (url.includes('/api/health') || url.includes('/health')) {
      return 0
    }

    // Skip static asset requests
    if (url.includes('/_next/') || url.includes('/static/')) {
      return 0
    }

    // Sample 10% of other transactions in production
    return process.env.NODE_ENV === 'production' ? 0.1 : 1.0
  },

  // Before sending event, add extra context and filter
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry] Server event captured (not sent in development):', {
        message: event.message,
        exception: hint?.originalException,
      })
      return null
    }

    // Add server context
    event.tags = {
      ...event.tags,
      runtime: 'nodejs',
      node_version: process.version,
    }

    // Scrub sensitive data
    if (event.request?.headers) {
      const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
      for (const header of sensitiveHeaders) {
        if (event.request.headers[header]) {
          event.request.headers[header] = '[REDACTED]'
        }
      }
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
