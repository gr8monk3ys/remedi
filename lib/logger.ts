/**
 * Structured Logger
 *
 * Simple logging utility that:
 * - Adds timestamps and context to logs
 * - Respects NODE_ENV for log verbosity
 * - Can be easily replaced with a production logger (Pino, Winston, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Minimum log level based on environment
 * Production only logs warnings and errors
 */
const MIN_LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

/**
 * Format log message with timestamp and context
 */
function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Check if a log level should be logged based on MIN_LOG_LEVEL
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

/**
 * Logger instance with structured methods
 */
export const logger = {
  /**
   * Debug level - verbose information for development
   */
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      console.debug(formatLog('debug', message, context));
    }
  },

  /**
   * Info level - general information about app operations
   */
  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      console.info(formatLog('info', message, context));
    }
  },

  /**
   * Warn level - potentially problematic situations
   */
  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      console.warn(formatLog('warn', message, context));
    }
  },

  /**
   * Error level - error conditions
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    if (shouldLog('error')) {
      const errorContext = {
        ...context,
        ...(error instanceof Error && {
          errorMessage: error.message,
          errorStack: error.stack,
        }),
      };
      console.error(formatLog('error', message, errorContext));
    }
  },
};

/**
 * Create a namespaced logger for a specific module
 *
 * @example
 * const log = createLogger('search-api');
 * log.info('Search started', { query: 'ibuprofen' });
 * // Output: [2024-01-15T10:30:00.000Z] [INFO] [search-api] Search started {"query":"ibuprofen"}
 */
export function createLogger(namespace: string) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(`[${namespace}] ${message}`, context),
    info: (message: string, context?: LogContext) =>
      logger.info(`[${namespace}] ${message}`, context),
    warn: (message: string, context?: LogContext) =>
      logger.warn(`[${namespace}] ${message}`, context),
    error: (message: string, error?: unknown, context?: LogContext) =>
      logger.error(`[${namespace}] ${message}`, error, context),
  };
}
