/**
 * Next.js Middleware
 *
 * This middleware runs before every request and adds security headers,
 * handles CORS, CSRF protection, and can implement rate limiting.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_CONFIG } from '@/lib/constants';
import {
  generateCSRFToken,
  setCSRFCookie,
  getCSRFTokenFromCookie,
  csrfMiddleware,
} from '@/lib/csrf';

/**
 * Middleware function that runs on every request
 * Adds security headers, CSRF protection, and handles basic security checks
 */
export function middleware(request: NextRequest) {
  // Check for blocked user agents first
  const userAgent = request.headers.get('user-agent') || '';
  if (isBlockedUserAgent(userAgent)) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // CSRF validation for API routes with state-changing methods
  if (request.nextUrl.pathname.startsWith('/api')) {
    const csrfError = csrfMiddleware(request);
    if (csrfError) {
      return csrfError;
    }
  }

  const response = NextResponse.next();

  // Add security headers
  addSecurityHeaders(response);

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    addCorsHeaders(response, request);
  }

  // Ensure CSRF token cookie exists
  if (!getCSRFTokenFromCookie(request)) {
    const token = generateCSRFToken();
    setCSRFCookie(response, token);
  }

  return response;
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): void {
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Enable XSS protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent DNS prefetching
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  // Disable browser features and APIs
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // Content Security Policy
  // Production: stricter policy without unsafe-eval
  // Development: allows unsafe-eval for hot reloading
  const isProduction = process.env.NODE_ENV === 'production';

  const cspDirectives = [
    "default-src 'self'",
    // In production, remove unsafe-eval; in dev, keep for hot reload
    isProduction
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'", // Required for Tailwind
    "img-src 'self' https://images.unsplash.com data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.fda.gov https://api.openai.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);

  // Strict Transport Security (HTTPS only)
  // Only set in production with HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }
}

/**
 * Add CORS headers for API routes
 * Allows same-origin by default, configure for cross-origin if needed
 */
function addCorsHeaders(response: NextResponse, request: NextRequest): void {
  const origin = request.headers.get('origin');

  // In development, allow all origins
  // In production, whitelist specific origins
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token'
  );
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Check if origin is allowed for CORS
 * Add your production domains here
 */
function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    'https://remedi.app',
    'https://www.remedi.app',
    // Add other production domains here
  ];

  // Also allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000');
  }

  return allowedOrigins.includes(origin);
}

/**
 * Check if user agent is blocked
 * Blocks common bots and scrapers
 */
function isBlockedUserAgent(userAgent: string): boolean {
  const lowerUserAgent = userAgent.toLowerCase();

  return SECURITY_CONFIG.BLOCKED_USER_AGENTS.some((blocked) =>
    lowerUserAgent.includes(blocked)
  );
}

/**
 * Middleware configuration
 * Specify which paths the middleware should run on
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
