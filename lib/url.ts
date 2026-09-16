/**
 * URL Utilities
 *
 * Centralized base URL resolution for the application.
 * Supports Vercel deployments, custom domains, and local development.
 */

/** The canonical production origin (custom domain). */
export const PRODUCTION_URL = "https://remedi.vivancedata.com";

/**
 * Get the application base URL.
 *
 * Resolution order:
 * 1. NEXT_PUBLIC_APP_URL (explicit override, e.g. custom domain)
 * 2. NEXT_PUBLIC_BASE_URL (common Next.js convention)
 * 3. PRODUCTION_URL on a Vercel production deployment, so canonical/OG
 *    URLs, the sitemap and emails never point at a *.vercel.app host
 *    even if the env vars above are missing
 * 4. VERCEL_URL (auto-set by Vercel; correct for preview deployments)
 * 5. Fallback to localhost:3000
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
