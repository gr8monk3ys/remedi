/**
 * Standardized API Response Types
 *
 * This module provides consistent response structures for all API endpoints.
 * All API routes should return ApiResponse<T> type for consistent error handling.
 */

import { createLogger } from "@/lib/logger";

const logger = createLogger("api-response");

/**
 * Standard API response wrapper
 * Success responses include data and optional metadata
 * Error responses include structured error information
 */
export type ApiResponse<T> =
  | { success: true; data: T; metadata?: ResponseMetadata }
  | { success: false; error: ApiError };

/**
 * Error information structure
 */
export interface ApiError {
  /** Machine-readable error code for programmatic handling */
  code: ErrorCode;
  /** Human-readable error message */
  message: string;
  /** Additional error context for debugging */
  details?: unknown;
  /** HTTP status code */
  statusCode: number;
}

/**
 * Response metadata for pagination and performance tracking
 */
export interface ResponseMetadata {
  /** Current page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Total number of items available */
  total?: number;
  /** Request processing time in milliseconds */
  processingTime?: number;
  /** API version */
  apiVersion?: string;
  /** Data source indicator */
  source?: "database" | "openfda" | "fallback";
}

/**
 * Standard error codes
 */
export type ErrorCode =
  // Client errors (4xx)
  | "INVALID_INPUT"
  | "MISSING_PARAMETER"
  | "RESOURCE_NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMIT_EXCEEDED"
  | "CONFLICT"
  // Server errors (5xx)
  | "INTERNAL_ERROR"
  | "DATABASE_ERROR"
  | "EXTERNAL_API_ERROR"
  | "SERVICE_UNAVAILABLE";

/**
 * HTTP status code mapping for error codes
 */
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  // 4xx Client Errors
  INVALID_INPUT: 400,
  MISSING_PARAMETER: 400,
  RESOURCE_NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  RATE_LIMIT_EXCEEDED: 429,
  CONFLICT: 409,
  // 5xx Server Errors
  INTERNAL_ERROR: 500,
  DATABASE_ERROR: 500,
  EXTERNAL_API_ERROR: 502,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Creates a successful API response
 *
 * @param data - Response data of type T
 * @param metadata - Optional response metadata
 * @returns Standardized success response
 *
 * @example
 * ```typescript
 * return NextResponse.json(
 *   successResponse(results, { total: 100, page: 1 }),
 *   { status: 200 }
 * );
 * ```
 */
export function successResponse<T>(
  data: T,
  metadata?: ResponseMetadata,
): ApiResponse<T> {
  const response: ApiResponse<T> = { success: true, data };
  if (metadata !== undefined) {
    response.metadata = metadata;
  }
  return response;
}

/**
 * Creates an error API response
 *
 * @param code - Machine-readable error code
 * @param message - Human-readable error message
 * @param details - Optional additional error context
 * @returns Standardized error response
 *
 * @example
 * ```typescript
 * return NextResponse.json(
 *   errorResponse('INVALID_INPUT', 'Query parameter is required'),
 *   { status: 400 }
 * );
 * ```
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: unknown,
): ApiResponse<never> {
  const statusCode = ERROR_STATUS_MAP[code];
  const error: ApiError = {
    code,
    message,
    statusCode,
  };

  if (details !== undefined) {
    error.details = details;
  }

  return {
    success: false,
    error,
  };
}

/**
 * Creates an error response from a caught error
 * Safely handles Error objects, strings, and unknown error types
 *
 * @param error - The caught error (Error, string, or unknown)
 * @param code - Error code to use (defaults to INTERNAL_ERROR)
 * @returns Standardized error response
 *
 * @example
 * ```typescript
 * try {
 *   const data = await fetchData();
 *   return NextResponse.json(successResponse(data));
 * } catch (error) {
 *   return NextResponse.json(
 *     errorResponseFromError(error, 'DATABASE_ERROR'),
 *     { status: 500 }
 *   );
 * }
 * ```
 */
export function errorResponseFromError(
  error: unknown,
  code: ErrorCode = "INTERNAL_ERROR",
): ApiResponse<never> {
  const isProduction = process.env.NODE_ENV === "production";

  // Always log the full error details server-side for observability
  logger.error("API error", error instanceof Error ? error : undefined, {
    code,
    ...(!(error instanceof Error) && { rawError: error }),
  });

  let message: string;
  let details: unknown;

  if (error instanceof Error) {
    // In production, return a generic message to avoid leaking internals
    message = isProduction ? "An unexpected error occurred" : error.message;
    details = isProduction
      ? undefined
      : {
          name: error.name,
          stack: error.stack,
        };
  } else if (typeof error === "string") {
    message = isProduction ? "An unexpected error occurred" : error;
  } else {
    message = "An unknown error occurred";
    details = isProduction ? undefined : error;
  }

  return errorResponse(code, message, details);
}

/**
 * Type guard to check if a response is a success response
 *
 * @param response - API response to check
 * @returns True if response is successful
 *
 * @example
 * ```typescript
 * const response = await fetchApi();
 * if (isSuccessResponse(response)) {
 *   console.log(response.data); // TypeScript knows data exists
 * } else {
 *   console.error(response.error); // TypeScript knows error exists
 * }
 * ```
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is { success: true; data: T; metadata?: ResponseMetadata } {
  return response.success === true;
}

/**
 * Type guard to check if a response is an error response
 *
 * @param response - API response to check
 * @returns True if response is an error
 */
export function isErrorResponse<T>(
  response: ApiResponse<T>,
): response is { success: false; error: ApiError } {
  return response.success === false;
}

/**
 * Get HTTP status code from error code
 *
 * @param code - Error code
 * @returns Corresponding HTTP status code
 */
export function getStatusCode(code: ErrorCode): number {
  return ERROR_STATUS_MAP[code];
}
