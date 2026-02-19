/**
 * Next.js Middleware
 *
 * Combines Clerk authentication with security headers, CORS, and maintenance mode.
 *
 * Replaces both the old app/proxy.ts (security middleware) and adds Clerk auth.
 *
 * @see https://clerk.com/docs/references/nextjs/clerk-middleware
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { csrfMiddleware, generateCSRFToken, setCSRFCookie } from "@/lib/csrf";

/**
 * Routes that are publicly accessible without authentication.
 * All other routes will require the user to be signed in.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/auth/error(.*)",
  "/about(.*)",
  "/faq(.*)",
  "/legal/(.*)",
  "/compare(.*)",
  "/contribute(.*)",
  "/interactions(.*)",
  "/landing(.*)",
  "/maintenance(.*)",
  "/pricing(.*)",
  "/remedy/(.*)",
  "/robots.txt",
  "/sitemap.xml",
  // Public API routes
  "/api/search(.*)",
  "/api/remedy/(.*)",
  "/api/remedies/(.*)",
  "/api/webhooks/(.*)",
  "/api/health(.*)",
  "/api/reviews", // GET is public (POST requires auth at route level)
  "/api/favorites(.*)", // Supports anonymous sessionId-based access
  "/api/search-history(.*)", // Supports anonymous sessionId-based access
  "/api/filter-preferences(.*)", // Supports anonymous sessionId-based access
  "/api/plan(.*)", // Lightweight plan/limits lookup (safe for anonymous)
  "/api/user-events(.*)", // Anonymous event tracking
  "/api/conversion-events(.*)", // Anonymous conversion tracking
  "/api/ai-search(.*)", // AI availability check is public
  "/api/interactions/check(.*)", // Public interaction checker
]);

/**
 * User agents to block (scrapers, bots)
 */
const BLOCKED_USER_AGENTS = [
  "semrushbot",
  "ahrefsbot",
  "bytespider",
  "gptbot",
  "claudebot",
];

const E2E_AUTH_COOKIE_NAMES = ["e2e_auth", "__session"] as const;

function isE2ELocalAuthEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.E2E_LOCAL_AUTH === "true";
}

function isE2EAuthenticated(req: NextRequest): boolean {
  return E2E_AUTH_COOKIE_NAMES.some((name) =>
    Boolean(req.cookies.get(name)?.value),
  );
}

/**
 * Set CORS headers on a response.
 * Access-Control-Allow-Origin is only set when the origin is in the allowed list.
 */
function setCORSHeaders(
  response: NextResponse,
  origin: string | null,
  allowedOrigins: string[],
): void {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, X-CSRF-Token",
  );
  response.headers.set("Access-Control-Max-Age", "86400");
}

/**
 * Add security headers to response.
 * In production, a per-request nonce replaces 'unsafe-inline' in script-src so
 * only scripts that carry the matching nonce attribute are executed by the browser.
 */
function addSecurityHeaders(response: NextResponse, nonce: string): void {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-DNS-Prefetch-Control", "on");

  const isProduction = process.env.NODE_ENV === "production";
  const clerkScriptSrc = "https://*.clerk.accounts.dev https://*.clerk.com";
  // Production: nonce-based allowlist eliminates 'unsafe-inline' XSS surface.
  // Development: keep 'unsafe-inline' + 'unsafe-eval' for HMR hot-reload.
  const scriptSrc = isProduction
    ? `script-src 'self' 'nonce-${nonce}' ${clerkScriptSrc} https://js.stripe.com`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${clerkScriptSrc} https://js.stripe.com`;
  const cspDirectives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://images.unsplash.com https://img.clerk.com https://*.clerk.com data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.fda.gov https://api.openai.com https://api.clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://*.sentry.io https://sentry.io https://*.ingest.sentry.io https://api.stripe.com",
    "frame-src 'self' https://accounts.clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://js.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspDirectives);

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
}

/**
 * Routes that should be accessible during maintenance mode
 */
const MAINTENANCE_ALLOWED_PATHS = [
  "/api/health",
  "/maintenance",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

/**
 * Build the list of allowed CORS origins.
 * Localhost origins are only included in non-production environments.
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
  ].filter(Boolean) as string[];

  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000", "http://localhost:3001");
  }

  return origins;
}

export default clerkMiddleware(async (authObj, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const e2eLocalAuthEnabled = isE2ELocalAuthEnabled();

  // Block bots/scrapers
  const userAgent = req.headers.get("user-agent") || "";
  if (
    BLOCKED_USER_AGENTS.some((blocked) =>
      userAgent.toLowerCase().includes(blocked),
    )
  ) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Handle OPTIONS preflight for CORS
  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    const allowedOrigins = getAllowedOrigins();
    const response = new NextResponse(null, { status: 204 });
    setCORSHeaders(response, origin, allowedOrigins);
    return response;
  }

  // Maintenance mode
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  if (
    isMaintenanceMode &&
    !MAINTENANCE_ALLOWED_PATHS.some(
      (p) =>
        pathname === p ||
        pathname.startsWith(p + "/") ||
        pathname.startsWith(p),
    )
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MAINTENANCE_MODE",
            message:
              "The service is currently under maintenance. Please try again later.",
          },
        },
        { status: 503 },
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.redirect(url);
  }

  // Protect non-public routes with Clerk
  if (!isPublicRoute(req)) {
    if (e2eLocalAuthEnabled) {
      if (!isE2EAuthenticated(req)) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "UNAUTHORIZED",
                message: "Authentication required",
              },
            },
            { status: 401 },
          );
        }

        const signInUrl = req.nextUrl.clone();
        signInUrl.pathname = "/sign-in";
        signInUrl.searchParams.set("redirect_url", req.nextUrl.href);
        return NextResponse.redirect(signInUrl);
      }
    } else {
      await authObj.protect();
    }
  }

  // CSRF validation for state-changing API requests
  if (pathname.startsWith("/api/")) {
    const csrfResponse = csrfMiddleware(req);
    if (csrfResponse) {
      return csrfResponse;
    }
  }

  // Generate a per-request nonce. It is forwarded to server components via the
  // x-nonce request header so they can stamp inline <script> tags with it.
  // The same value is embedded in the CSP response header so the browser
  // enforces the allowlist.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  // Continue with the request, propagating the modified request headers, then
  // apply security headers (including the nonce-based CSP) to the response.
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  addSecurityHeaders(response, nonce);

  // Issue a CSRF token cookie if one does not already exist.
  // This allows client-side code (fetchWithCSRF) to read the cookie and
  // send it back as a header on subsequent state-changing requests.
  const existingCsrfToken = req.cookies.get("csrf_token")?.value;
  if (!existingCsrfToken) {
    const newToken = generateCSRFToken();
    setCSRFCookie(response, newToken);
  }

  // CORS for API routes
  if (pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    const allowedOrigins = getAllowedOrigins();
    setCORSHeaders(response, origin, allowedOrigins);
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
