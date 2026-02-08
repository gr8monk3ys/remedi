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

/**
 * Routes that are publicly accessible without authentication.
 * All other routes will require the user to be signed in.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/auth/error(.*)",
  "/faq(.*)",
  "/legal/(.*)",
  "/compare(.*)",
  "/contribute(.*)",
  "/landing(.*)",
  "/maintenance(.*)",
  "/robots.txt",
  "/sitemap.xml",
  // Public API routes
  "/api/search(.*)",
  "/api/remedy/(.*)",
  "/api/webhooks/(.*)",
  "/api/health(.*)",
  "/api/reviews", // GET is public (POST requires auth at route level)
  "/api/favorites(.*)", // Supports anonymous sessionId-based access
  "/api/search-history(.*)", // Supports anonymous sessionId-based access
  "/api/filter-preferences(.*)", // Supports anonymous sessionId-based access
  "/api/user-events(.*)", // Anonymous event tracking
  "/api/conversion-events(.*)", // Anonymous conversion tracking
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

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): void {
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
  const cspDirectives = [
    "default-src 'self'",
    isProduction
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://images.unsplash.com https://img.clerk.com data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.fda.gov https://api.openai.com https://api.clerk.com",
    "frame-src 'self' https://accounts.clerk.com",
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

export default clerkMiddleware(async (authObj, req: NextRequest) => {
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
    const response = new NextResponse(null, { status: 204 });
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

  // Protect non-public routes with Clerk
  if (!isPublicRoute(req)) {
    await authObj.protect();
  }

  // Continue with the request and add security headers
  const response = NextResponse.next();
  addSecurityHeaders(response);

  // CORS for API routes
  if (pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_BASE_URL,
      "http://localhost:3000",
      "http://localhost:3001",
    ].filter(Boolean);

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
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
