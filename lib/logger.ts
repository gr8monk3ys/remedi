/**
 * Structured Logger
 *
 * Production-ready logging utility that:
 * - Adds timestamps and context to logs
 * - Supports configurable log levels via environment variables
 * - Outputs JSON format in production for log aggregation
 * - Supports external logging services (optional)
 * - Integrates with Sentry for error tracking (when available)
 *
 * Note: Sentry is loaded lazily to avoid pulling @sentry/nextjs (which
 * includes @sentry/node) into client-side dynamic import chunks. A
 * static top-level import of @sentry/nextjs causes dynamic(() => import())
 * to silently fail because the server-only modules crash during
 * client-side module evaluation.
 */

// Sentry interface — only the methods we actually use
interface SentryLike {
  addBreadcrumb(breadcrumb: {
    category?: string;
    message?: string;
    level?: string;
    data?: Record<string, unknown>;
  }): void;
  captureException(
    error: unknown,
    hint?: {
      tags?: Record<string, string | undefined>;
      extra?: Record<string, unknown>;
    },
  ): void;
  captureMessage(
    message: string,
    options?: {
      level?: string;
      tags?: Record<string, string | undefined>;
      extra?: Record<string, unknown>;
    },
  ): void;
}

// Lazy Sentry accessor — avoids top-level import that breaks client dynamic imports.
// On the server side, Sentry is available via require(). On the client, the
// sentry.client.config.ts already initializes Sentry globally, so we access
// it through the window.__SENTRY__ hub or simply skip if unavailable.
let _sentry: SentryLike | null = null;
let _sentryLoaded = false;

function getSentry(): SentryLike | null {
  if (!_sentryLoaded) {
    _sentryLoaded = true;
    try {
      if (typeof window === "undefined") {
        // Server-side: safe to require @sentry/nextjs
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        _sentry = require("@sentry/nextjs") as SentryLike;
      } else {
        // Client-side: Sentry is already initialized by sentry.client.config.ts
        // Access it through the global __SENTRY__ to avoid bundling server-only code
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sentryModule = (window as any).__SENTRY__;
        if (sentryModule?.hub) {
          // Sentry SDK v7+ exposes hub on window
          _sentry = sentryModule.hub.getClient() as SentryLike | null;
        }
        // If not found via __SENTRY__, try the already-loaded module
        // (sentry.client.config.ts loads it at app startup)
        if (!_sentry && typeof globalThis !== "undefined") {
          // The Sentry client SDK is initialized but we can't import it here
          // without pulling in server-only code. Console logging is sufficient
          // on the client — Sentry's automatic error capture handles the rest.
          _sentry = null;
        }
      }
    } catch {
      // Not available in this context
      _sentry = null;
    }
  }
  return _sentry;
}

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  namespace?: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get minimum log level from environment
 * Defaults: production=info, development=debug, test=warn
 */
function getMinLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel;
  }

  switch (process.env.NODE_ENV) {
    case "production":
      return "info";
    case "test":
      return "warn";
    default:
      return "debug";
  }
}

const MIN_LOG_LEVEL = getMinLogLevel();
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Check if a log level should be logged based on MIN_LOG_LEVEL
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

/**
 * Format log entry for output
 * In production: JSON format for log aggregation
 * In development: Human-readable format
 */
function formatLog(entry: LogEntry): string {
  if (IS_PRODUCTION) {
    // JSON format for production log aggregation (Datadog, Logtail, etc.)
    return JSON.stringify({
      ...entry,
      env: process.env.NODE_ENV,
      version:
        process.env.npm_package_version ||
        process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    });
  }

  // Human-readable format for development
  const namespace = entry.namespace ? `[${entry.namespace}] ` : "";
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
  const errorStr = entry.error ? ` Error: ${entry.error.message}` : "";

  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${namespace}${entry.message}${errorStr}${contextStr}`;
}

/**
 * Send log to external service (if configured)
 * Supports services like Logtail, Datadog, LogDNA, etc.
 */
async function sendToExternalService(entry: LogEntry): Promise<void> {
  const serviceUrl = process.env.LOG_SERVICE_URL;
  const apiKey = process.env.LOG_SERVICE_API_KEY;

  if (!serviceUrl || !apiKey) {
    return;
  }

  try {
    // Non-blocking log send
    fetch(serviceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...entry,
        source: "remedi",
        env: process.env.NODE_ENV,
      }),
    }).catch(() => {
      // Silently fail - don't let logging failures affect the app
    });
  } catch {
    // Silently fail
  }
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  namespace?: string,
  error?: unknown,
  context?: LogContext,
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (namespace) {
    entry.namespace = namespace;
  }

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error instanceof Error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  } else if (error) {
    entry.error = {
      name: "UnknownError",
      message: String(error),
    };
  }

  return entry;
}

/**
 * Log a message at the specified level
 */
function log(
  level: LogLevel,
  message: string,
  namespace?: string,
  error?: unknown,
  context?: LogContext,
): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry = createLogEntry(level, message, namespace, error, context);
  const formatted = formatLog(entry);

  // Console output
  switch (level) {
    case "debug":
      console.debug(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      // Add breadcrumb to Sentry (when available)
      getSentry()?.addBreadcrumb({
        category: namespace || "app",
        message,
        level: "warning",
        data: context,
      });
      break;
    case "error":
      console.error(formatted);
      // Report to Sentry (when available)
      {
        const sentry = getSentry();
        if (sentry) {
          if (error instanceof Error) {
            sentry.captureException(error, {
              tags: { namespace },
              extra: context,
            });
          } else {
            sentry.captureMessage(message, {
              level: "error",
              tags: { namespace },
              extra: { error, ...context },
            });
          }
        }
      }
      break;
  }

  // Send to external service in production
  if (IS_PRODUCTION) {
    sendToExternalService(entry);
  }
}

/**
 * Logger instance with structured methods
 */
export const logger = {
  /**
   * Debug level - verbose information for development
   */
  debug(message: string, context?: LogContext): void {
    log("debug", message, undefined, undefined, context);
  },

  /**
   * Info level - general information about app operations
   */
  info(message: string, context?: LogContext): void {
    log("info", message, undefined, undefined, context);
  },

  /**
   * Warn level - potentially problematic situations
   */
  warn(message: string, context?: LogContext): void {
    log("warn", message, undefined, undefined, context);
  },

  /**
   * Error level - error conditions
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    log("error", message, undefined, error, context);
  },
};

/**
 * Create a namespaced logger for a specific module
 *
 * @example
 * const log = createLogger('search-api');
 * log.info('Search started', { query: 'ibuprofen' });
 * // Production: {"timestamp":"2024-01-15T10:30:00.000Z","level":"info","message":"Search started","namespace":"search-api","context":{"query":"ibuprofen"}}
 * // Development: [2024-01-15T10:30:00.000Z] [INFO] [search-api] Search started {"query":"ibuprofen"}
 */
export function createLogger(namespace: string) {
  return {
    debug: (message: string, context?: LogContext) =>
      log("debug", message, namespace, undefined, context),
    info: (message: string, context?: LogContext) =>
      log("info", message, namespace, undefined, context),
    warn: (message: string, context?: LogContext) =>
      log("warn", message, namespace, undefined, context),
    error: (message: string, error?: unknown, context?: LogContext) =>
      log("error", message, namespace, error, context),
  };
}

/**
 * Log request/response for API routes
 *
 * @example
 * export async function GET(request: Request) {
 *   const requestId = logRequest(request);
 *   // ... handle request
 *   logResponse(requestId, 200, { items: 10 });
 * }
 */
export function logRequest(request: Request, context?: LogContext): string {
  const requestId = crypto.randomUUID();
  const url = new URL(request.url);

  log("info", "Request received", "http", undefined, {
    requestId,
    method: request.method,
    path: url.pathname,
    query: url.search,
    ...context,
  });

  return requestId;
}

export function logResponse(
  requestId: string,
  status: number,
  context?: LogContext,
): void {
  const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

  log(level, "Response sent", "http", undefined, {
    requestId,
    status,
    ...context,
  });
}

/**
 * Performance timing helper
 *
 * @example
 * const timer = createTimer('database-query');
 * const result = await prisma.user.findMany();
 * timer.end({ count: result.length });
 */
export function createTimer(operation: string) {
  const start = performance.now();

  return {
    end(context?: LogContext): number {
      const duration = Math.round(performance.now() - start);
      log("debug", `${operation} completed`, "performance", undefined, {
        operation,
        durationMs: duration,
        ...context,
      });
      return duration;
    },
  };
}
