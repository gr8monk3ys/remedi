/**
 * Client-side fetch utilities with CSRF token support
 *
 * Automatically includes CSRF token header for state-changing requests.
 * For retry logic, use `lib/fetch-with-retry.ts`.
 */

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Get CSRF token from browser cookies
 * Only works client-side (in browser)
 */
export function getCSRFToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === CSRF_COOKIE_NAME) {
      return value || null;
    }
  }
  return null;
}

/**
 * Check if HTTP method requires CSRF token
 */
function requiresCSRF(method: string): boolean {
  const statefulMethods = ["POST", "PUT", "DELETE", "PATCH"];
  return statefulMethods.includes(method.toUpperCase());
}

/**
 * Fetch with automatic CSRF token inclusion
 *
 * @example
 * const response = await fetchWithCSRF('/api/ai-search', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ query: 'aspirin' }),
 * });
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const method = options.method?.toUpperCase() || "GET";

  // Only add CSRF header for state-changing methods
  if (requiresCSRF(method)) {
    const csrfToken = getCSRFToken();

    if (csrfToken) {
      const headers = new Headers(options.headers);
      headers.set(CSRF_HEADER_NAME, csrfToken);
      options = { ...options, headers };
    }
  }

  return fetch(url, options);
}

/**
 * POST request with CSRF token
 */
export async function postWithCSRF(
  url: string,
  body: unknown,
  options: RequestInit = {},
): Promise<Response> {
  return fetchWithCSRF(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...Object.fromEntries(new Headers(options.headers).entries()),
    },
    body: JSON.stringify(body),
  });
}
