/**
 * Typed API Client
 *
 * Centralizes the fetch-parse-check pattern used across client components.
 * All API routes return standardized ApiResponse<T> shape, so this client
 * handles JSON parsing, success checking, and typed error throwing in one place.
 *
 * Automatically includes CSRF tokens for state-changing requests (POST, PUT, DELETE, PATCH).
 */

import type { ErrorCode } from "./response";

/**
 * Typed error class for API failures.
 * Preserves the structured error information from the API response.
 */
export class ApiClientError extends Error {
  /** Machine-readable error code */
  readonly code: ErrorCode | string;
  /** HTTP status code */
  readonly statusCode: number;
  /** Additional error context */
  readonly details?: unknown;

  constructor(
    message: string,
    code: ErrorCode | string,
    statusCode: number,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ---------- CSRF helpers (inlined to avoid circular deps) ----------

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

function getCSRFToken(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === CSRF_COOKIE_NAME) {
      return value || null;
    }
  }
  return null;
}

function requiresCSRF(method: string): boolean {
  return ["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase());
}

// ---------- Internal request helper ----------

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  metadata?: Record<string, unknown>;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  // Inject CSRF header for state-changing methods
  const headers = new Headers(options.headers);
  if (requiresCSRF(method)) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers.set(CSRF_HEADER_NAME, csrfToken);
    }
  }

  const response = await fetch(url, { ...options, headers });

  // Handle non-JSON responses (network errors, 500 HTML pages, etc.)
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new ApiClientError(
      `Request failed with status ${response.status}`,
      "INTERNAL_ERROR",
      response.status,
    );
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    const err = json.error;
    throw new ApiClientError(
      err.message,
      err.code,
      err.statusCode,
      err.details,
    );
  }

  return json.data;
}

// ---------- Public API ----------

/**
 * Typed API client that eliminates the duplicated fetch-parse-check pattern.
 *
 * Each method:
 * 1. Calls fetch with CSRF support
 * 2. Parses the JSON response
 * 3. Checks the `success` field
 * 4. Throws `ApiClientError` if `!success`
 * 5. Returns the typed `data` field
 *
 * @example
 * ```ts
 * // GET request
 * const usage = await apiClient.get<UsageData>('/api/usage')
 *
 * // POST request with body
 * const report = await apiClient.post<{ report: Report }>('/api/reports', {
 *   title: 'My Report',
 *   queryType: 'condition',
 * })
 *
 * // Error handling
 * try {
 *   await apiClient.get('/api/protected')
 * } catch (err) {
 *   if (err instanceof ApiClientError && err.code === 'UNAUTHORIZED') {
 *     // handle auth error
 *   }
 * }
 * ```
 */
export const apiClient = {
  /**
   * Send a GET request and return the typed data.
   */
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return request<T>(url, { ...options, method: "GET" });
  },

  /**
   * Send a POST request with an optional JSON body and return the typed data.
   */
  async post<T>(
    url: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    const headers = new Headers(options?.headers);
    if (body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return request<T>(url, {
      ...options,
      method: "POST",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Send a PUT request with an optional JSON body and return the typed data.
   */
  async put<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    const headers = new Headers(options?.headers);
    if (body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return request<T>(url, {
      ...options,
      method: "PUT",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Send a DELETE request and return the typed data.
   */
  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    return request<T>(url, { ...options, method: "DELETE" });
  },
};
