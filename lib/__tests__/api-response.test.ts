/**
 * Unit Tests for API Response Utilities
 *
 * Tests the standardized API response functions in lib/api/response.ts
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  successResponse,
  errorResponse,
  errorResponseFromError,
  isSuccessResponse,
  isErrorResponse,
  getStatusCode,
} from "../api/response";
import type { ApiResponse, ErrorCode } from "../api/response";

describe("API Response Utilities", () => {
  describe("successResponse", () => {
    it("should create a success response with data", () => {
      const data = { id: "1", name: "Test" };
      const response = successResponse(data);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual(data);
        expect(response.metadata).toBeUndefined();
      }
    });

    it("should create a success response with metadata", () => {
      const data = [{ id: "1" }, { id: "2" }];
      const metadata = {
        page: 1,
        pageSize: 10,
        total: 100,
        processingTime: 50,
        apiVersion: "v1",
      };

      const response = successResponse(data, metadata);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual(data);
        expect(response.metadata).toEqual(metadata);
      }
    });

    it("should handle null data", () => {
      const response = successResponse(null);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBeNull();
      }
    });

    it("should handle empty array data", () => {
      const response = successResponse([]);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual([]);
      }
    });

    it("should handle complex nested data", () => {
      const complexData = {
        user: {
          id: "1",
          profile: {
            name: "Test",
            settings: {
              notifications: true,
            },
          },
        },
        items: [{ id: 1, children: [{ id: 1.1 }] }],
      };

      const response = successResponse(complexData);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual(complexData);
      }
    });
  });

  describe("errorResponse", () => {
    it("should create an error response with code and message", () => {
      const response = errorResponse(
        "INVALID_INPUT",
        "Query parameter is required",
      );

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe("INVALID_INPUT");
        expect(response.error.message).toBe("Query parameter is required");
        expect(response.error.statusCode).toBe(400);
        expect(response.error.details).toBeUndefined();
      }
    });

    it("should create an error response with details", () => {
      const details = { field: "email", reason: "invalid format" };
      const response = errorResponse(
        "INVALID_INPUT",
        "Validation failed",
        details,
      );

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.details).toEqual(details);
      }
    });

    it("should map error codes to correct status codes", () => {
      const testCases: Array<{ code: ErrorCode; expectedStatus: number }> = [
        { code: "INVALID_INPUT", expectedStatus: 400 },
        { code: "MISSING_PARAMETER", expectedStatus: 400 },
        { code: "RESOURCE_NOT_FOUND", expectedStatus: 404 },
        { code: "UNAUTHORIZED", expectedStatus: 401 },
        { code: "FORBIDDEN", expectedStatus: 403 },
        { code: "RATE_LIMIT_EXCEEDED", expectedStatus: 429 },
        { code: "CONFLICT", expectedStatus: 409 },
        { code: "INTERNAL_ERROR", expectedStatus: 500 },
        { code: "DATABASE_ERROR", expectedStatus: 500 },
        { code: "EXTERNAL_API_ERROR", expectedStatus: 502 },
        { code: "SERVICE_UNAVAILABLE", expectedStatus: 503 },
      ];

      for (const { code, expectedStatus } of testCases) {
        const response = errorResponse(code, "Test message");
        if (!response.success) {
          expect(response.error.statusCode).toBe(expectedStatus);
        }
      }
    });
  });

  describe("errorResponseFromError", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should handle Error objects", () => {
      const error = new Error("Something went wrong");
      const response = errorResponseFromError(error);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.message).toBe("Something went wrong");
        expect(response.error.code).toBe("INTERNAL_ERROR");
        expect(response.error.details).toHaveProperty("name", "Error");
      }
    });

    it("should handle string errors", () => {
      const response = errorResponseFromError("String error message");

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.message).toBe("String error message");
      }
    });

    it("should handle unknown error types", () => {
      const response = errorResponseFromError({ weird: "object" });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.message).toBe("An unknown error occurred");
        expect(response.error.details).toEqual({ weird: "object" });
      }
    });

    it("should handle null errors", () => {
      const response = errorResponseFromError(null);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.message).toBe("An unknown error occurred");
      }
    });

    it("should include stack trace in development", () => {
      vi.stubEnv("NODE_ENV", "development");
      const error = new Error("Dev error");
      const response = errorResponseFromError(error);

      expect(response.success).toBe(false);
      if (!response.success && response.error.details) {
        const details = response.error.details as { stack?: string };
        expect(details.stack).toBeDefined();
      }
    });

    it("should exclude stack trace in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      const error = new Error("Prod error");
      const response = errorResponseFromError(error);

      expect(response.success).toBe(false);
      if (!response.success && response.error.details) {
        const details = response.error.details as { stack?: string };
        expect(details.stack).toBeUndefined();
      }
    });

    it("should use custom error code", () => {
      const error = new Error("Database failed");
      const response = errorResponseFromError(error, "DATABASE_ERROR");

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe("DATABASE_ERROR");
        expect(response.error.statusCode).toBe(500);
      }
    });
  });

  describe("isSuccessResponse", () => {
    it("should return true for success responses", () => {
      const response: ApiResponse<string> = {
        success: true,
        data: "test",
      };

      expect(isSuccessResponse(response)).toBe(true);
    });

    it("should return false for error responses", () => {
      const response: ApiResponse<string> = {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Test error",
          statusCode: 400,
        },
      };

      expect(isSuccessResponse(response)).toBe(false);
    });

    it("should narrow type correctly", () => {
      const response: ApiResponse<{ id: string }> = successResponse({
        id: "1",
      });

      if (isSuccessResponse(response)) {
        // TypeScript should know data exists
        expect(response.data.id).toBe("1");
      }
    });
  });

  describe("isErrorResponse", () => {
    it("should return true for error responses", () => {
      const response: ApiResponse<string> = {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Server error",
          statusCode: 500,
        },
      };

      expect(isErrorResponse(response)).toBe(true);
    });

    it("should return false for success responses", () => {
      const response: ApiResponse<string> = {
        success: true,
        data: "test",
      };

      expect(isErrorResponse(response)).toBe(false);
    });

    it("should narrow type correctly", () => {
      const response: ApiResponse<string> = errorResponse(
        "UNAUTHORIZED",
        "Not logged in",
      );

      if (isErrorResponse(response)) {
        // TypeScript should know error exists
        expect(response.error.code).toBe("UNAUTHORIZED");
        expect(response.error.statusCode).toBe(401);
      }
    });
  });

  describe("getStatusCode", () => {
    it("should return correct status codes for all error codes", () => {
      expect(getStatusCode("INVALID_INPUT")).toBe(400);
      expect(getStatusCode("MISSING_PARAMETER")).toBe(400);
      expect(getStatusCode("RESOURCE_NOT_FOUND")).toBe(404);
      expect(getStatusCode("UNAUTHORIZED")).toBe(401);
      expect(getStatusCode("FORBIDDEN")).toBe(403);
      expect(getStatusCode("RATE_LIMIT_EXCEEDED")).toBe(429);
      expect(getStatusCode("CONFLICT")).toBe(409);
      expect(getStatusCode("INTERNAL_ERROR")).toBe(500);
      expect(getStatusCode("DATABASE_ERROR")).toBe(500);
      expect(getStatusCode("EXTERNAL_API_ERROR")).toBe(502);
      expect(getStatusCode("SERVICE_UNAVAILABLE")).toBe(503);
    });
  });

  describe("Type safety", () => {
    it("should work with generic types", () => {
      interface User {
        id: string;
        email: string;
      }

      const user: User = { id: "1", email: "test@example.com" };
      const response: ApiResponse<User> = successResponse(user);

      if (isSuccessResponse(response)) {
        expect(response.data.id).toBe("1");
        expect(response.data.email).toBe("test@example.com");
      }
    });

    it("should work with array types", () => {
      const items = ["a", "b", "c"];
      const response: ApiResponse<string[]> = successResponse(items);

      if (isSuccessResponse(response)) {
        expect(response.data).toHaveLength(3);
      }
    });

    it("should work with union types", () => {
      type Result = { status: "ok" } | { status: "pending" };
      const result: Result = { status: "ok" };
      const response: ApiResponse<Result> = successResponse(result);

      if (isSuccessResponse(response)) {
        expect(response.data.status).toBe("ok");
      }
    });
  });
});
