/**
 * Unit Tests for CSRF Protection Utilities
 */

import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import {
  generateCSRFToken,
  requiresCSRFValidation,
  shouldSkipCSRF,
  setCSRFCookie,
  getCSRFTokenFromCookie,
  getCSRFTokenFromHeader,
  validateCSRFToken,
  csrfMiddleware,
} from "../csrf";

describe("CSRF Protection Utilities", () => {
  describe("generateCSRFToken", () => {
    it("should generate a 64-character hex string", () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(64); // 32 bytes * 2 hex chars
    });

    it("should only contain valid hex characters", () => {
      const token = generateCSRFToken();
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it("should generate unique tokens on each call", () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      const token3 = generateCSRFToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });
  });

  describe("requiresCSRFValidation", () => {
    it("should return true for state-changing methods", () => {
      expect(requiresCSRFValidation("POST")).toBe(true);
      expect(requiresCSRFValidation("PUT")).toBe(true);
      expect(requiresCSRFValidation("DELETE")).toBe(true);
      expect(requiresCSRFValidation("PATCH")).toBe(true);
    });

    it("should return true for lowercase method names", () => {
      expect(requiresCSRFValidation("post")).toBe(true);
      expect(requiresCSRFValidation("put")).toBe(true);
      expect(requiresCSRFValidation("delete")).toBe(true);
      expect(requiresCSRFValidation("patch")).toBe(true);
    });

    it("should return false for safe methods", () => {
      expect(requiresCSRFValidation("GET")).toBe(false);
      expect(requiresCSRFValidation("HEAD")).toBe(false);
      expect(requiresCSRFValidation("OPTIONS")).toBe(false);
    });
  });

  describe("shouldSkipCSRF", () => {
    it("should skip NextAuth routes", () => {
      expect(shouldSkipCSRF("/api/auth/signin")).toBe(true);
      expect(shouldSkipCSRF("/api/auth/signout")).toBe(true);
      expect(shouldSkipCSRF("/api/auth/callback/google")).toBe(true);
      expect(shouldSkipCSRF("/api/auth/session")).toBe(true);
    });

    it("should not skip regular API routes", () => {
      expect(shouldSkipCSRF("/api/search")).toBe(false);
      expect(shouldSkipCSRF("/api/favorites")).toBe(false);
      expect(shouldSkipCSRF("/api/remedy/123")).toBe(false);
    });

    it("should not skip non-API routes", () => {
      expect(shouldSkipCSRF("/")).toBe(false);
      expect(shouldSkipCSRF("/remedy/123")).toBe(false);
      expect(shouldSkipCSRF("/search")).toBe(false);
    });
  });

  describe("setCSRFCookie", () => {
    it("should set CSRF cookie on response", () => {
      const response = NextResponse.next();
      const token = "test-csrf-token-12345678901234567890123456789012";

      setCSRFCookie(response, token);

      // Verify cookie was set
      const cookies = response.cookies.getAll();
      const csrfCookie = cookies.find((c) => c.name === "csrf_token");
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie?.value).toBe(token);
    });
  });

  describe("getCSRFTokenFromCookie", () => {
    it("should return token from cookie", () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          Cookie: "csrf_token=test-token-value",
        },
      });

      const token = getCSRFTokenFromCookie(request);
      expect(token).toBe("test-token-value");
    });

    it("should return undefined when cookie not present", () => {
      const request = new NextRequest("http://localhost:3000/api/test");

      const token = getCSRFTokenFromCookie(request);
      expect(token).toBeUndefined();
    });
  });

  describe("getCSRFTokenFromHeader", () => {
    it("should return token from header", () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "x-csrf-token": "header-token-value",
        },
      });

      const token = getCSRFTokenFromHeader(request);
      expect(token).toBe("header-token-value");
    });

    it("should return undefined when header not present", () => {
      const request = new NextRequest("http://localhost:3000/api/test");

      const token = getCSRFTokenFromHeader(request);
      expect(token).toBeUndefined();
    });
  });

  describe("validateCSRFToken", () => {
    it("should return true when tokens match", () => {
      const token = generateCSRFToken();
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          Cookie: `csrf_token=${token}`,
          "x-csrf-token": token,
        },
      });

      expect(validateCSRFToken(request)).toBe(true);
    });

    it("should return false when tokens do not match", () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          Cookie: "csrf_token=token-a",
          "x-csrf-token": "token-b",
        },
      });

      expect(validateCSRFToken(request)).toBe(false);
    });

    it("should return false when cookie is missing", () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "x-csrf-token": "some-token",
        },
      });

      expect(validateCSRFToken(request)).toBe(false);
    });

    it("should return false when header is missing", () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          Cookie: "csrf_token=some-token",
        },
      });

      expect(validateCSRFToken(request)).toBe(false);
    });

    it("should return false when both are missing", () => {
      const request = new NextRequest("http://localhost:3000/api/test");

      expect(validateCSRFToken(request)).toBe(false);
    });

    it("should return false when tokens have different lengths", () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          Cookie: "csrf_token=short",
          "x-csrf-token": "much-longer-token-value",
        },
      });

      expect(validateCSRFToken(request)).toBe(false);
    });
  });

  describe("csrfMiddleware", () => {
    it("should return null for GET requests", () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });

      const result = csrfMiddleware(request);
      expect(result).toBeNull();
    });

    it("should return null for auth routes", () => {
      const request = new NextRequest("http://localhost:3000/api/auth/signin", {
        method: "POST",
      });

      const result = csrfMiddleware(request);
      expect(result).toBeNull();
    });

    it("should return 403 response for invalid CSRF token on POST", () => {
      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "POST",
      });

      const result = csrfMiddleware(request);
      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });

    it("should return null for valid CSRF token on POST", () => {
      const token = generateCSRFToken();
      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "POST",
        headers: {
          Cookie: `csrf_token=${token}`,
          "x-csrf-token": token,
        },
      });

      const result = csrfMiddleware(request);
      expect(result).toBeNull();
    });

    it("should validate for PUT, DELETE, PATCH methods", () => {
      const methods = ["PUT", "DELETE", "PATCH"];

      for (const method of methods) {
        const request = new NextRequest("http://localhost:3000/api/test", {
          method,
        });

        const result = csrfMiddleware(request);
        expect(result?.status).toBe(403);
      }
    });
  });
});
