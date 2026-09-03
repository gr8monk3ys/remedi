/**
 * Typed API Client
 *
 * Centralizes the fetch-parse-check pattern used across client components.
 * All API routes return standardized ApiResponse<T> shape, so this client
 * handles JSON parsing, success checking, and typed error throwing in one place.
 *
 * Automatically includes CSRF tokens for state-changing requests (POST, PUT, DELETE, PATCH).
 */

import type { ApiResponse, ErrorCode } from "./response";

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
  /** Seconds to wait before retrying; present on rate-limit rejections */
  readonly retryAfter?: number;

  constructor(
    message: string,
    code: ErrorCode | string,
    statusCode: number,
    details?: unknown,
    retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.retryAfter = retryAfter;
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

/**
 * Seconds to wait before retrying, from whichever source actually carries it.
 *
 * `rateLimitExceededResponse` may leave `error.retryAfter` undefined while the
 * `Retry-After` header still falls back to 60, so the header is real
 * information rather than a redundant copy of the body. Older nested
 * `details.retryAfter` payloads are honoured too.
 */
function resolveRetryAfter(
  response: Response,
  err: { retryAfter?: number; details?: unknown } | undefined,
): number | undefined {
  const candidates: unknown[] = [
    err?.retryAfter,
    err?.details && typeof err.details === "object"
      ? (err.details as { retryAfter?: unknown }).retryAfter
      : undefined,
    response.headers.get("Retry-After") ?? undefined,
  ];

  for (const candidate of candidates) {
    const seconds = Number(candidate);
    if (candidate !== undefined && Number.isFinite(seconds) && seconds > 0) {
      return Math.ceil(seconds);
    }
  }
  return undefined;
}

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

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (error) {
    // An aborted request was deliberately superseded by its caller. It must
    // stay a DOMException so callers can tell it apart from a real failure.
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    // A transport failure — offline, DNS, CORS. Surface it
    // as an ApiClientError so callers have one error type to discriminate on
    // rather than a bare TypeError that every `instanceof` check misses.
    throw new ApiClientError(
      error instanceof Error ? error.message : "Network request failed",
      "SERVICE_UNAVAILABLE",
      0,
    );
  }

  // Non-JSON body: an HTML error page, a gateway timeout, an empty response.
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new ApiClientError(
      `Request failed with status ${response.status}`,
      response.ok ? "INTERNAL_ERROR" : "SERVICE_UNAVAILABLE",
      response.status,
    );
  }

  let json: ApiResponse<T>;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      `Malformed response body (status ${response.status})`,
      "INTERNAL_ERROR",
      response.status,
    );
  }

  // The transport and the body must agree. A 500 carrying success:true is not
  // a success, and a body claiming success on a failed request is not one
  // either — trusting the body alone is how an error becomes a silent value.
  if (!response.ok || !json?.success) {
    const err = json && !json.success ? json.error : undefined;
    throw new ApiClientError(
      err?.message || `Request failed with status ${response.status}`,
      err?.code || "INTERNAL_ERROR",
      err?.statusCode ?? response.status,
      err?.details,
      resolveRetryAfter(response, err),
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

  /** PATCH with a JSON body. */
  async patch<T>(
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
      method: "PATCH",
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
