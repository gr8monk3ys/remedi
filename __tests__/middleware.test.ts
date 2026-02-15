/**
 * Tests for Next.js Middleware
 *
 * Tests security headers, CORS, bot blocking, maintenance mode,
 * CSRF protection, and route protection logic.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock CSRF module before importing middleware
vi.mock("@/lib/csrf", () => ({
  csrfMiddleware: vi.fn(() => null),
  generateCSRFToken: vi.fn(() => "mock-csrf-token-abc123"),
  setCSRFCookie: vi.fn(),
}));

// Use vi.hoisted so mockIsPublicRoute is available inside the hoisted vi.mock factory
const { mockIsPublicRoute } = vi.hoisted(() => ({
  mockIsPublicRoute: vi.fn(() => true),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: vi.fn((handler: (...args: unknown[]) => unknown) => handler),
  createRouteMatcher: vi.fn(() => mockIsPublicRoute),
  auth: vi.fn().mockResolvedValue({ userId: null }),
  currentUser: vi.fn().mockResolvedValue(null),
  clerkClient: vi.fn().mockResolvedValue({
    users: { updateUserMetadata: vi.fn() },
  }),
}));

import middleware from "@/proxy";
import { csrfMiddleware, generateCSRFToken, setCSRFCookie } from "@/lib/csrf";

/**
 * Helper to create a mock Clerk auth object
 */
function createMockAuthObj(options: { userId?: string | null } = {}) {
  return {
    userId: options.userId ?? null,
    protect: vi.fn(),
    redirectToSignIn: vi.fn(),
  };
}

/**
 * Helper to create a NextRequest with optional headers, method, and cookies
 */
function createRequest(
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  } = {},
): NextRequest {
  const { method = "GET", headers = {}, cookies: cookieMap = {} } = options;
  const req = new NextRequest(new URL(path, "http://localhost:3000"), {
    method,
    headers: new Headers(headers),
  });

  // Set cookies on the request
  for (const [name, value] of Object.entries(cookieMap)) {
    req.cookies.set(name, value);
  }

  return req;
}

/**
 * Call the middleware with a request and return the response.
 * The global mock makes clerkMiddleware return the inner handler,
 * so we call it directly with (authObj, req).
 */
async function callMiddleware(
  req: NextRequest,
  authOptions: { userId?: string | null } = {},
): Promise<NextResponse> {
  const authObj = createMockAuthObj(authOptions);
  const handler = middleware as unknown as (
    authObj: ReturnType<typeof createMockAuthObj>,
    req: NextRequest,
  ) => Promise<NextResponse>;
  return handler(authObj, req);
}

describe("Middleware", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPublicRoute.mockReturnValue(true);
    process.env = { ...originalEnv };
    process.env.NODE_ENV = "test";
    process.env.MAINTENANCE_MODE = "false";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  // ==========================================================================
  // Security Headers
  // ==========================================================================

  describe("Security Headers", () => {
    it("should include X-Frame-Options: DENY", async () => {
      const req = createRequest("/");
      const res = await callMiddleware(req);

      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    });

    it("should include X-Content-Type-Options: nosniff", async () => {
      const req = createRequest("/");
      const res = await callMiddleware(req);

      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });

    it("should include Referrer-Policy header", async () => {
      const req = createRequest("/");
      const res = await callMiddleware(req);

      expect(res.headers.get("Referrer-Policy")).toBe(
        "strict-origin-when-cross-origin",
      );
    });

    it("should include Content-Security-Policy header", async () => {
      const req = createRequest("/");
      const res = await callMiddleware(req);

      const csp = res.headers.get("Content-Security-Policy");
      expect(csp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("base-uri 'self'");
    });

    it("should include Permissions-Policy header", async () => {
      const req = createRequest("/");
      const res = await callMiddleware(req);

      const permPolicy = res.headers.get("Permissions-Policy");
      expect(permPolicy).toContain("camera=()");
      expect(permPolicy).toContain("microphone=()");
      expect(permPolicy).toContain("geolocation=()");
    });

    it("should include X-XSS-Protection header", async () => {
      const req = createRequest("/");
      const res = await callMiddleware(req);

      expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
    });

    it("should include X-DNS-Prefetch-Control header", async () => {
      const req = createRequest("/");
      const res = await callMiddleware(req);

      expect(res.headers.get("X-DNS-Prefetch-Control")).toBe("on");
    });

    it("should include unsafe-eval in CSP in non-production environment", async () => {
      process.env.NODE_ENV = "development";
      const req = createRequest("/");
      const res = await callMiddleware(req);

      const csp = res.headers.get("Content-Security-Policy");
      expect(csp).toContain("'unsafe-eval'");
    });

    it("should NOT include unsafe-eval in CSP in production environment", async () => {
      process.env.NODE_ENV = "production";
      const req = createRequest("/");
      const res = await callMiddleware(req);

      const csp = res.headers.get("Content-Security-Policy");
      expect(csp).not.toContain("'unsafe-eval'");
    });

    it("should include HSTS in production", async () => {
      process.env.NODE_ENV = "production";
      const req = createRequest("/");
      const res = await callMiddleware(req);

      expect(res.headers.get("Strict-Transport-Security")).toBe(
        "max-age=31536000; includeSubDomains",
      );
    });

    it("should NOT include HSTS in non-production", async () => {
      process.env.NODE_ENV = "development";
      const req = createRequest("/");
      const res = await callMiddleware(req);

      expect(res.headers.get("Strict-Transport-Security")).toBeNull();
    });
  });

  // ==========================================================================
  // CORS
  // ==========================================================================

  describe("CORS", () => {
    it("should return 204 for OPTIONS preflight on API routes", async () => {
      const req = createRequest("/api/search", {
        method: "OPTIONS",
        headers: { origin: "http://localhost:3000" },
      });
      const res = await callMiddleware(req);

      expect(res.status).toBe(204);
    });

    it("should include Access-Control-Allow-Methods on preflight", async () => {
      const req = createRequest("/api/search", {
        method: "OPTIONS",
        headers: { origin: "http://localhost:3000" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
        "GET, POST, PUT, DELETE, OPTIONS",
      );
    });

    it("should include Access-Control-Allow-Headers on preflight", async () => {
      const req = createRequest("/api/search", {
        method: "OPTIONS",
        headers: { origin: "http://localhost:3000" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Access-Control-Allow-Headers")).toContain(
        "Content-Type",
      );
      expect(res.headers.get("Access-Control-Allow-Headers")).toContain(
        "Authorization",
      );
      expect(res.headers.get("Access-Control-Allow-Headers")).toContain(
        "X-CSRF-Token",
      );
    });

    it("should include Access-Control-Max-Age on preflight", async () => {
      const req = createRequest("/api/search", {
        method: "OPTIONS",
        headers: { origin: "http://localhost:3000" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
    });

    it("should set Access-Control-Allow-Origin for allowed origins on preflight", async () => {
      const req = createRequest("/api/search", {
        method: "OPTIONS",
        headers: { origin: "http://localhost:3000" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000",
      );
    });

    it("should include Vary: Origin for allowed origins on preflight", async () => {
      const req = createRequest("/api/search", {
        method: "OPTIONS",
        headers: { origin: "http://localhost:3000" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Vary")).toBe("Origin");
    });

    it("should NOT set Access-Control-Allow-Origin for disallowed origins on preflight", async () => {
      const req = createRequest("/api/search", {
        method: "OPTIONS",
        headers: { origin: "http://evil.com" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });

    it("should set CORS headers on normal API requests from allowed origins", async () => {
      const req = createRequest("/api/search", {
        headers: { origin: "http://localhost:3000" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000",
      );
      expect(res.headers.get("Vary")).toBe("Origin");
    });

    it("should NOT set Access-Control-Allow-Origin for disallowed origins on normal requests", async () => {
      const req = createRequest("/api/search", {
        headers: { origin: "http://evil.com" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });

    it("should include Access-Control-Allow-Methods on normal API requests", async () => {
      const req = createRequest("/api/search", {
        headers: { origin: "http://localhost:3000" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
        "GET, POST, PUT, DELETE, OPTIONS",
      );
    });

    it("should NOT add CORS headers on non-API routes", async () => {
      const req = createRequest("/about", {
        headers: { origin: "http://localhost:3000" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
      expect(res.headers.get("Access-Control-Allow-Methods")).toBeNull();
    });

    it("should allow localhost:3001 as origin in non-production", async () => {
      process.env.NODE_ENV = "development";
      const req = createRequest("/api/search", {
        headers: { origin: "http://localhost:3001" },
      });
      const res = await callMiddleware(req);

      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3001",
      );
    });
  });

  // ==========================================================================
  // Bot Blocking
  // ==========================================================================

  describe("Bot Blocking", () => {
    it("should return 403 for semrushbot User-Agent", async () => {
      const req = createRequest("/", {
        headers: { "user-agent": "Mozilla/5.0 (compatible; SemrushBot/7~bl)" },
      });
      const res = await callMiddleware(req);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Access denied");
    });

    it("should return 403 for ahrefsbot User-Agent", async () => {
      const req = createRequest("/", {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; AhrefsBot/7.0)",
        },
      });
      const res = await callMiddleware(req);

      expect(res.status).toBe(403);
    });

    it("should return 403 for bytespider User-Agent", async () => {
      const req = createRequest("/", {
        headers: { "user-agent": "Bytespider" },
      });
      const res = await callMiddleware(req);

      expect(res.status).toBe(403);
    });

    it("should return 403 for gptbot User-Agent", async () => {
      const req = createRequest("/", {
        headers: {
          "user-agent":
            "Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.0)",
        },
      });
      const res = await callMiddleware(req);

      expect(res.status).toBe(403);
    });

    it("should return 403 for claudebot User-Agent", async () => {
      const req = createRequest("/", {
        headers: { "user-agent": "ClaudeBot/1.0" },
      });
      const res = await callMiddleware(req);

      expect(res.status).toBe(403);
    });

    it("should allow normal browser User-Agents", async () => {
      const req = createRequest("/", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });
      const res = await callMiddleware(req);

      expect(res.status).not.toBe(403);
    });

    it("should allow requests with no User-Agent", async () => {
      const req = createRequest("/");
      const res = await callMiddleware(req);

      expect(res.status).not.toBe(403);
    });

    it("should perform case-insensitive bot matching", async () => {
      const req = createRequest("/", {
        headers: { "user-agent": "SEMRUSHBOT/7.0" },
      });
      const res = await callMiddleware(req);

      expect(res.status).toBe(403);
    });
  });

  // ==========================================================================
  // Route Protection
  // ==========================================================================

  describe("Route Protection", () => {
    it("should NOT call protect() for public routes", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      const authObj = createMockAuthObj();
      const req = createRequest("/");

      const handler = middleware as unknown as (
        authObj: ReturnType<typeof createMockAuthObj>,
        req: NextRequest,
      ) => Promise<NextResponse>;
      await handler(authObj, req);

      expect(authObj.protect).not.toHaveBeenCalled();
    });

    it("should call protect() for non-public routes", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      const authObj = createMockAuthObj();
      const req = createRequest("/dashboard");

      const handler = middleware as unknown as (
        authObj: ReturnType<typeof createMockAuthObj>,
        req: NextRequest,
      ) => Promise<NextResponse>;
      await handler(authObj, req);

      expect(authObj.protect).toHaveBeenCalled();
    });

    it("should call protect() for protected API routes", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      const authObj = createMockAuthObj();
      const req = createRequest("/api/contributions");

      const handler = middleware as unknown as (
        authObj: ReturnType<typeof createMockAuthObj>,
        req: NextRequest,
      ) => Promise<NextResponse>;
      await handler(authObj, req);

      expect(authObj.protect).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Maintenance Mode
  // ==========================================================================

  describe("Maintenance Mode", () => {
    beforeEach(() => {
      process.env.MAINTENANCE_MODE = "true";
    });

    it("should return 503 for API routes during maintenance", async () => {
      const req = createRequest("/api/search");
      const res = await callMiddleware(req);

      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("MAINTENANCE_MODE");
    });

    it("should redirect non-API routes to /maintenance page", async () => {
      const req = createRequest("/about");
      const res = await callMiddleware(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("/maintenance");
    });

    it("should allow /api/health during maintenance", async () => {
      const req = createRequest("/api/health");
      const res = await callMiddleware(req);

      expect(res.status).not.toBe(503);
    });

    it("should allow /maintenance page during maintenance", async () => {
      const req = createRequest("/maintenance");
      const res = await callMiddleware(req);

      // Should NOT redirect or return 503
      expect(res.status).not.toBe(503);
      expect(res.status).not.toBe(307);
    });

    it("should allow /_next assets during maintenance", async () => {
      const req = createRequest("/_next/static/chunk.js");
      const res = await callMiddleware(req);

      expect(res.status).not.toBe(503);
      expect(res.status).not.toBe(307);
    });

    it("should allow /robots.txt during maintenance", async () => {
      const req = createRequest("/robots.txt");
      const res = await callMiddleware(req);

      expect(res.status).not.toBe(503);
      expect(res.status).not.toBe(307);
    });

    it("should NOT activate maintenance when MAINTENANCE_MODE is not true", async () => {
      process.env.MAINTENANCE_MODE = "false";
      const req = createRequest("/about");
      const res = await callMiddleware(req);

      expect(res.status).not.toBe(307);
      expect(res.status).not.toBe(503);
    });
  });

  // ==========================================================================
  // CSRF Protection
  // ==========================================================================

  describe("CSRF Protection", () => {
    it("should invoke csrfMiddleware for API routes", async () => {
      const req = createRequest("/api/favorites", { method: "POST" });
      await callMiddleware(req);

      expect(csrfMiddleware).toHaveBeenCalledWith(req);
    });

    it("should NOT invoke csrfMiddleware for non-API routes", async () => {
      const req = createRequest("/about");
      await callMiddleware(req);

      expect(csrfMiddleware).not.toHaveBeenCalled();
    });

    it("should return CSRF error response when csrfMiddleware returns a response", async () => {
      const csrfError = NextResponse.json(
        { success: false, error: { code: "CSRF_VALIDATION_FAILED" } },
        { status: 403 },
      );
      vi.mocked(csrfMiddleware).mockReturnValueOnce(csrfError);

      const req = createRequest("/api/favorites", { method: "POST" });
      const res = await callMiddleware(req);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error.code).toBe("CSRF_VALIDATION_FAILED");
    });

    it("should set CSRF cookie when one does not exist", async () => {
      const req = createRequest("/about");
      await callMiddleware(req);

      expect(generateCSRFToken).toHaveBeenCalled();
      expect(setCSRFCookie).toHaveBeenCalled();
    });

    it("should NOT set CSRF cookie when one already exists", async () => {
      const req = createRequest("/about", {
        cookies: { csrf_token: "existing-token" },
      });
      await callMiddleware(req);

      expect(generateCSRFToken).not.toHaveBeenCalled();
      expect(setCSRFCookie).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Middleware Config
  // ==========================================================================

  describe("Middleware Config", () => {
    it("should export a config object with matcher patterns", async () => {
      const { config } = await import("@/proxy");

      expect(config).toBeDefined();
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
      expect(config.matcher.length).toBeGreaterThan(0);
    });

    it("should have a matcher that includes API routes", async () => {
      const { config } = await import("@/proxy");

      const hasApiMatcher = config.matcher.some(
        (pattern: string) =>
          pattern.includes("api") || pattern.includes("trpc"),
      );
      expect(hasApiMatcher).toBe(true);
    });
  });
});
