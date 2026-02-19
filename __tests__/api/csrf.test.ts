/**
 * Tests for CSRF protection utilities (lib/csrf.ts)
 *
 * Tests the double-submit cookie pattern:
 * - Token validation (matching cookie vs header)
 * - Method-based bypass (GET/HEAD skip CSRF)
 * - Path-based bypass (webhook routes)
 * - csrfMiddleware integration
 */

import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import {
  validateCSRFToken,
  requiresCSRFValidation,
  shouldSkipCSRF,
  csrfMiddleware,
  generateCSRFToken,
} from "@/lib/csrf";

function makeRequest(
  method: string,
  pathname: string,
  opts: { cookieToken?: string; headerToken?: string } = {},
): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  const headers: Record<string, string> = {};
  if (opts.headerToken) {
    headers["x-csrf-token"] = opts.headerToken;
  }
  const request = new NextRequest(url, { method, headers });
  if (opts.cookieToken) {
    request.cookies.set("csrf_token", opts.cookieToken);
  }
  return request;
}

describe("generateCSRFToken", () => {
  it("should generate a 64-character hex string", () => {
    const token = generateCSRFToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should generate unique tokens on each call", () => {
    const t1 = generateCSRFToken();
    const t2 = generateCSRFToken();
    expect(t1).not.toBe(t2);
  });
});

describe("requiresCSRFValidation", () => {
  it("should require validation for POST", () => {
    expect(requiresCSRFValidation("POST")).toBe(true);
  });

  it("should require validation for PUT", () => {
    expect(requiresCSRFValidation("PUT")).toBe(true);
  });

  it("should require validation for DELETE", () => {
    expect(requiresCSRFValidation("DELETE")).toBe(true);
  });

  it("should require validation for PATCH", () => {
    expect(requiresCSRFValidation("PATCH")).toBe(true);
  });

  it("should NOT require validation for GET", () => {
    expect(requiresCSRFValidation("GET")).toBe(false);
  });

  it("should NOT require validation for HEAD", () => {
    expect(requiresCSRFValidation("HEAD")).toBe(false);
  });

  it("should NOT require validation for OPTIONS", () => {
    expect(requiresCSRFValidation("OPTIONS")).toBe(false);
  });
});

describe("shouldSkipCSRF", () => {
  it("should skip Stripe webhook path", () => {
    expect(shouldSkipCSRF("/api/webhooks/stripe")).toBe(true);
  });

  it("should skip Clerk webhook path", () => {
    expect(shouldSkipCSRF("/api/webhooks/clerk")).toBe(true);
  });

  it("should NOT skip regular API routes", () => {
    expect(shouldSkipCSRF("/api/favorites")).toBe(false);
    expect(shouldSkipCSRF("/api/contributions")).toBe(false);
    expect(shouldSkipCSRF("/api/search")).toBe(false);
  });

  it("should NOT skip admin routes", () => {
    expect(shouldSkipCSRF("/api/admin/users/123")).toBe(false);
  });
});

describe("validateCSRFToken", () => {
  it("should return true when cookie and header tokens match", () => {
    const token = "abc123def456";
    const request = makeRequest("POST", "/api/favorites", {
      cookieToken: token,
      headerToken: token,
    });
    expect(validateCSRFToken(request)).toBe(true);
  });

  it("should return false when tokens do not match", () => {
    const request = makeRequest("POST", "/api/favorites", {
      cookieToken: "token-a",
      headerToken: "token-b",
    });
    expect(validateCSRFToken(request)).toBe(false);
  });

  it("should return false when cookie token is missing", () => {
    const request = makeRequest("POST", "/api/favorites", {
      headerToken: "some-token",
    });
    expect(validateCSRFToken(request)).toBe(false);
  });

  it("should return false when header token is missing", () => {
    const request = makeRequest("POST", "/api/favorites", {
      cookieToken: "some-token",
    });
    expect(validateCSRFToken(request)).toBe(false);
  });

  it("should return false when both tokens are missing", () => {
    const request = makeRequest("POST", "/api/favorites");
    expect(validateCSRFToken(request)).toBe(false);
  });

  it("should be case-sensitive in token comparison", () => {
    const request = makeRequest("POST", "/api/favorites", {
      cookieToken: "Token123",
      headerToken: "token123",
    });
    expect(validateCSRFToken(request)).toBe(false);
  });
});

describe("csrfMiddleware", () => {
  it("should return null (pass) for GET requests — no CSRF needed", () => {
    const request = makeRequest("GET", "/api/favorites");
    expect(csrfMiddleware(request)).toBeNull();
  });

  it("should return null for HEAD requests", () => {
    const request = makeRequest("HEAD", "/api/health");
    expect(csrfMiddleware(request)).toBeNull();
  });

  it("should return null for OPTIONS requests", () => {
    const request = makeRequest("OPTIONS", "/api/search");
    expect(csrfMiddleware(request)).toBeNull();
  });

  it("should return null for Stripe webhook POST (skipped path)", () => {
    const request = makeRequest("POST", "/api/webhooks/stripe", {
      // No CSRF tokens — webhook routes bypass the check
    });
    expect(csrfMiddleware(request)).toBeNull();
  });

  it("should return null for Clerk webhook POST (skipped path)", () => {
    const request = makeRequest("POST", "/api/webhooks/clerk");
    expect(csrfMiddleware(request)).toBeNull();
  });

  it("should return 403 for POST without CSRF token", () => {
    const request = makeRequest("POST", "/api/favorites");
    const response = csrfMiddleware(request);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.status).toBe(403);
  });

  it("should return 403 for POST with mismatched CSRF token", () => {
    const request = makeRequest("POST", "/api/favorites", {
      cookieToken: "valid-token",
      headerToken: "wrong-token",
    });
    const response = csrfMiddleware(request);
    expect(response?.status).toBe(403);
  });

  it("should return null (pass) for POST with valid matching token", () => {
    const token = generateCSRFToken();
    const request = makeRequest("POST", "/api/favorites", {
      cookieToken: token,
      headerToken: token,
    });
    expect(csrfMiddleware(request)).toBeNull();
  });

  it("should return 403 for DELETE without CSRF token", () => {
    const request = makeRequest("DELETE", "/api/favorites");
    const response = csrfMiddleware(request);
    expect(response?.status).toBe(403);
  });

  it("should include CSRF_VALIDATION_FAILED error code in 403 response", async () => {
    const request = makeRequest("POST", "/api/contributions");
    const response = csrfMiddleware(request);
    const body = await response?.json();
    expect(body?.error?.code).toBe("CSRF_VALIDATION_FAILED");
  });
});
