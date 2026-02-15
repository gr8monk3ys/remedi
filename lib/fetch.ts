/**
 * CSRF-aware Fetch Utilities
 *
 * Provides fetch wrappers that automatically include CSRF tokens
 * for state-changing requests (POST, PUT, DELETE, PATCH).
 */

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";

/**
 * Get CSRF token from cookies
 */
export function getCSRFToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`),
  );
  return match ? match[1] : null;
}

/**
 * Check if method requires CSRF token
 */
function requiresCSRF(method: string): boolean {
  return ["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase());
}

/**
 * Fetch with automatic CSRF token inclusion
 * Automatically adds CSRF token header for state-changing methods
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const method = options.method?.toUpperCase() || "GET";

  const headers = new Headers(options.headers);

  // Add CSRF token for state-changing methods
  if (requiresCSRF(method)) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers.set(CSRF_HEADER_NAME, csrfToken);
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * JSON fetch with CSRF - convenience wrapper for JSON APIs
 */
export async function fetchJSON<T>(
  url: string,
  options: RequestInit = {},
): Promise<{ response: Response; data: T }> {
  const headers = new Headers(options.headers);

  // Set Content-Type for requests with body
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchWithCSRF(url, {
    ...options,
    headers,
  });

  const data = (await response.json()) as T;

  return { response, data };
}

/**
 * Type-safe API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode?: number;
  };
  metadata?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

/**
 * Typed JSON fetch for API routes
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const { data } = await fetchJSON<ApiResponse<T>>(url, options);
  return data;
}
