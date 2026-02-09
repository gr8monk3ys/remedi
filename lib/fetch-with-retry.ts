/**
 * Fetch with Retry
 *
 * Wraps fetch with exponential backoff retry logic.
 * Returns the response on success or throws after all retries exhausted.
 */

import { fetchWithCSRF } from "@/lib/fetch";

interface RetryOptions {
  /** Max number of retries (default: 2) */
  retries?: number;
  /** Base delay in ms before first retry (default: 500) */
  baseDelay?: number;
  /** Use CSRF-aware fetch (default: true) */
  csrf?: boolean;
}

/**
 * Fetch with automatic retry and exponential backoff.
 * Retries on network errors and 5xx responses. Does NOT retry 4xx errors.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {},
): Promise<Response> {
  const { retries = 2, baseDelay = 500, csrf = true } = retryOptions;
  const doFetch = csrf ? fetchWithCSRF : fetch;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await doFetch(url, options);

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry server errors (5xx)
      if (response.status >= 500 && attempt < retries) {
        await delay(baseDelay * Math.pow(2, attempt));
        continue;
      }

      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < retries) {
        await delay(baseDelay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError ?? new Error("Fetch failed after retries");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
