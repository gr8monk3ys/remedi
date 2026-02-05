/**
 * CSRF Protection Utilities
 *
 * Implements double-submit cookie pattern for CSRF protection.
 * Works with both authenticated and anonymous users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Set CSRF token cookie on response
 */
export function setCSRFCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Get CSRF token from request cookie
 */
export function getCSRFTokenFromCookie(request: NextRequest): string | undefined {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Get CSRF token from request header
 */
export function getCSRFTokenFromHeader(request: NextRequest): string | undefined {
  return request.headers.get(CSRF_HEADER_NAME) || undefined;
}

/**
 * Validate CSRF token (compare cookie and header)
 * Uses Node.js crypto.timingSafeEqual to prevent timing attacks
 */
function timingSafeEqualStrings(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const maxLength = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;

  for (let i = 0; i < maxLength; i += 1) {
    const aVal = aBytes[i] ?? 0;
    const bVal = bBytes[i] ?? 0;
    diff |= aVal ^ bVal;
  }

  return diff === 0;
}

export function validateCSRFToken(request: NextRequest): boolean {
  const cookieToken = getCSRFTokenFromCookie(request);
  const headerToken = getCSRFTokenFromHeader(request);

  if (!cookieToken || !headerToken) {
    return false;
  }

  return timingSafeEqualStrings(cookieToken, headerToken);
}

/**
 * Check if request method requires CSRF validation
 */
export function requiresCSRFValidation(method: string): boolean {
  const statefulMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  return statefulMethods.includes(method.toUpperCase());
}

/**
 * Check if request path should skip CSRF validation
 * (e.g., NextAuth routes handle their own CSRF)
 */
export function shouldSkipCSRF(pathname: string): boolean {
  const skipPaths = [
    '/api/auth/', // NextAuth handles its own CSRF
    '/api/webhooks/stripe', // Stripe webhooks are signed, not browser-initiated
  ];

  return skipPaths.some((path) => pathname.startsWith(path));
}

/**
 * CSRF validation middleware helper
 * Returns error response if validation fails, null if valid
 */
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  const { method } = request;
  const pathname = request.nextUrl.pathname;

  // Skip if not a state-changing method
  if (!requiresCSRFValidation(method)) {
    return null;
  }

  // Skip for paths that handle their own CSRF
  if (shouldSkipCSRF(pathname)) {
    return null;
  }

  // Validate CSRF token
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CSRF_VALIDATION_FAILED',
          message: 'Invalid or missing CSRF token',
          statusCode: 403,
        },
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Server-side helper to get CSRF token for forms/requests
 * Use this in server components to pass token to client
 */
export async function getServerCSRFToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}
