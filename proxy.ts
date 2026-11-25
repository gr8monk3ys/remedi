/**
 * Next.js Proxy (middleware)
 *
 * Security headers, CORS, maintenance mode, CSRF, and the first auth gate.
 *
 * The auth gate only checks that a Better Auth session cookie is present; it
 * cannot tell a valid session from a forged or expired one. The real check is
 * server-side (lib/auth.ts), which every protected page and route performs.
 *
 * @see https://www.better-auth.com/docs/integrations/next
 */

import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { csrfMiddleware, generateCSRFToken, setCSRFCookie } from "@/lib/csrf";
import { sentryIngestOrigin } from "@/lib/csp-origins";
import { isPublicPath } from "@/lib/public-routes";

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

/**
 * Generate a cryptographic nonce for CSP.
 * Uses crypto.randomUUID() which is available in all modern runtimes
 * (Node 19+, Edge, Workers). The UUID is base64-encoded to produce a
 * compact, URL-safe token suitable for CSP nonce values.
 */
function generateCspNonce(): string {
  const uuid = crypto.randomUUID();
  // btoa is available in Edge and Node 16+; produces a short base64 token.
  return btoa(uuid);
}

/**
 * Add security headers to response
 */

function addSecurityHeaders(response: NextResponse, nonce: string): void {
  // X-Frame-Options is set to a hardcoded literal ("DENY"); no user input is
  // involved, so the semgrep x-frame-options-misconfiguration rule is a false
  // positive here.
  response.headers.set("X-Frame-Options", "DENY"); // nosemgrep: javascript.express.security.x-frame-options-misconfiguration.x-frame-options-misconfiguration
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );
  // "0" per current OWASP guidance: the legacy XSS auditor this header
  // enabled was itself an XS-Leak vector and has been removed from modern
  // browsers; the CSP set below is the actual XSS defense.
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set("X-DNS-Prefetch-Control", "on");

  const isProduction = process.env.NODE_ENV === "production";
  // Errors can only be reported to a host the policy allows to be contacted.
  const sentryOrigin = sentryIngestOrigin();
  const sentryConnectSrc = sentryOrigin ? ` ${sentryOrigin}` : "";
  // 'unsafe-inline' is kept as a fallback for older browsers that do not
  // support nonces. Nonce-aware browsers ignore 'unsafe-inline' when a
  // nonce source is present, so this is safe and follows CSP best practices.
  const cspDirectives = [
    "default-src 'self'",
    isProduction
      ? `script-src 'self' 'unsafe-inline' 'nonce-${nonce}'`
      : `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://images.unsplash.com data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' https://api.fda.gov https://api.openai.com${sentryConnectSrc}`,
    "frame-src 'self'",
    // Sentry's Session Replay compressor creates Workers from blob:
    // URLs; without worker-src the browser falls back to script-src and logs a
    // CSP violation on every page load.
    "worker-src 'self' blob:",
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

export default async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

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

  // Protect non-public routes: cookie presence only, see the header comment.
  if (!isPublicPath(pathname) && !getSessionCookie(req)) {
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
    signInUrl.search = "";
    signInUrl.searchParams.set(
      "redirect_url",
      `${pathname}${req.nextUrl.search}`,
    );
    return NextResponse.redirect(signInUrl);
  }

  // CSRF validation for state-changing API requests
  if (pathname.startsWith("/api/")) {
    const csrfResponse = csrfMiddleware(req);
    if (csrfResponse) {
      return csrfResponse;
    }
  }

  // Generate a per-request CSP nonce and forward it to the server
  // component tree via a custom request header. layout.tsx reads this
  // value with `headers().get('x-nonce')` and passes it to <Script> tags.
  const nonce = generateCspNonce();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  // Continue with the request and add security headers
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
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
