/**
 * Next.js Middleware
 *
 * Handles:
 * - Maintenance mode (basic check, full bypass requires API)
 * - Security headers
 * - CORS for API routes
 *
 * NOTE: Authentication checks are handled in individual route handlers
 * because the PrismaAdapter doesn't support Edge runtime.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
 * API routes that need CORS headers
 */
const API_PATHS = ["/api/"];

/**
 * Check if a path matches any pattern in the list
 */
function matchesPath(path: string, patterns: string[]): boolean {
  return patterns.some(
    (pattern) =>
      path === pattern ||
      path.startsWith(pattern + "/") ||
      path.startsWith(pattern),
  );
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Disable browser features we don't need
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );

  // XSS protection (legacy, but still useful for older browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // DNS prefetch control
  response.headers.set("X-DNS-Prefetch-Control", "on");

  return response;
}

/**
 * Add CORS headers for API routes
 */
function addCorsHeaders(
  response: NextResponse,
  request: NextRequest,
): NextResponse {
  const origin = request.headers.get("origin");

  // Allow requests from the same origin or configured origins
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
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

/**
 * Create maintenance mode response
 */
function createMaintenanceResponse(request: NextRequest): NextResponse {
  // For API routes, return JSON
  if (request.nextUrl.pathname.startsWith("/api/")) {
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

  // For pages, redirect to maintenance page
  const url = request.nextUrl.clone();
  url.pathname = "/maintenance";
  return NextResponse.redirect(url);
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Handle OPTIONS requests for CORS preflight
  if (request.method === "OPTIONS" && matchesPath(pathname, API_PATHS)) {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, request);
  }

  // Check maintenance mode (basic check - full bypass in API routes)
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  if (isMaintenanceMode && !matchesPath(pathname, MAINTENANCE_ALLOWED_PATHS)) {
    // Note: Admin bypass check happens in API routes since we can't use Prisma here
    // For pages, we redirect to maintenance page
    // Admin users can access /api/health to check status
    return createMaintenanceResponse(request);
  }

  // Continue with the request
  const response = NextResponse.next();

  // Add security headers to all responses
  addSecurityHeaders(response);

  // Add CORS headers to API responses
  if (matchesPath(pathname, API_PATHS)) {
    addCorsHeaders(response, request);
  }

  return response;
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
