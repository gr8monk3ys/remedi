/**
 * Unit Tests for Authorization Utilities
 *
 * Tests for:
 * - isValidSessionId: UUID v4 format validation
 * - verifyOwnership: request-level ownership verification
 * - verifyResourceOwnership: resource-level ownership verification
 * - getEffectiveIdentifiers: user/session identifier extraction
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth before importing authorization
const mockGetCurrentUser = vi.fn().mockResolvedValue(null);

vi.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({
      status: init?.status || 200,
      body,
    })),
  },
}));

vi.mock("@/lib/api/response", () => ({
  errorResponse: vi.fn((code, message) => ({ error: { code, message } })),
}));

import {
  isValidSessionId,
  verifyOwnership,
  verifyResourceOwnership,
  getEffectiveIdentifiers,
} from "../authorization";

describe("Authorization Utilities", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue(null);
  });

  describe("isValidSessionId", () => {
    it("should return true for valid UUID v4 format", () => {
      expect(isValidSessionId("550e8400-e29b-41d4-a716-446655440000")).toBe(
        true,
      );
      expect(isValidSessionId("6ba7b810-9dad-41d1-80b4-00c04fd430c8")).toBe(
        true,
      );
      expect(isValidSessionId("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(
        true,
      );
    });

    it("should return true for valid UUID v4 with uppercase letters", () => {
      expect(isValidSessionId("550E8400-E29B-41D4-A716-446655440000")).toBe(
        true,
      );
      expect(isValidSessionId("F47AC10B-58CC-4372-A567-0E02B2C3D479")).toBe(
        true,
      );
    });

    it("should return false for invalid UUID formats", () => {
      expect(isValidSessionId("550e8400-e29b-41d4-a716")).toBe(false);
      expect(
        isValidSessionId("550e8400-e29b-41d4-a716-446655440000-extra"),
      ).toBe(false);
      expect(isValidSessionId("550e8400e29b41d4a716446655440000")).toBe(false);
      expect(isValidSessionId("550e8400-e29b-11d4-a716-446655440000")).toBe(
        false,
      );
      expect(isValidSessionId("550e8400-e29b-41d4-c716-446655440000")).toBe(
        false,
      );
    });

    it("should return false for non-UUID strings", () => {
      expect(isValidSessionId("")).toBe(false);
      expect(isValidSessionId("not-a-uuid")).toBe(false);
      expect(isValidSessionId("12345")).toBe(false);
      expect(isValidSessionId("user@email.com")).toBe(false);
    });

    it("should return false for SQL injection attempts", () => {
      expect(isValidSessionId("'; DROP TABLE users; --")).toBe(false);
      expect(isValidSessionId("1 OR 1=1")).toBe(false);
    });

    it("should return false for special characters", () => {
      expect(isValidSessionId("<script>alert(1)</script>")).toBe(false);
      expect(isValidSessionId("../../../etc/passwd")).toBe(false);
    });
  });

  describe("verifyOwnership", () => {
    const VALID_SESSION_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
    const INVALID_SESSION_ID = "not-a-valid-uuid";

    describe("when userId is provided", () => {
      it("should return authorized when userId matches the authenticated user", async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          image: null,
          role: "user",
        });

        const result = await verifyOwnership("user-123");

        expect(result.authorized).toBe(true);
        expect(result.currentUserId).toBe("user-123");
        expect(result.error).toBeUndefined();
      });

      it("should return 403 error when userId does not match authenticated user", async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          image: null,
          role: "user",
        });

        const result = await verifyOwnership("user-999");

        expect(result.authorized).toBe(false);
        expect(result.currentUserId).toBe("user-123");
        expect(result.error).toBeDefined();
        expect(result.error!.status).toBe(403);
      });

      it("should return 401 error when userId is provided but user is not authenticated", async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await verifyOwnership("user-123");

        expect(result.authorized).toBe(false);
        expect(result.currentUserId).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error!.status).toBe(401);
      });

      it("should handle various user ID formats", async () => {
        const userIdFormats = [
          "user_2abc123def",
          "clk_usr_abcdef123456",
          "a1b2c3d4-e5f6-4789-a012-b34c56d78e90",
          "simple-id",
        ];

        for (const userId of userIdFormats) {
          mockGetCurrentUser.mockResolvedValue({
            id: userId,
            name: "Test",
            email: "test@example.com",
            image: null,
            role: "user",
          });

          const result = await verifyOwnership(userId);
          expect(result.authorized).toBe(true);
          expect(result.currentUserId).toBe(userId);
        }
      });
    });

    describe("when only sessionId is provided", () => {
      it("should return authorized for a valid session ID", async () => {
        const result = await verifyOwnership(undefined, VALID_SESSION_ID);

        expect(result.authorized).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should return 400 error for an invalid session ID format", async () => {
        const result = await verifyOwnership(undefined, INVALID_SESSION_ID);

        expect(result.authorized).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.status).toBe(400);
      });

      it("should allow anonymous access with valid session ID even when user is authenticated", async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: "user-123",
          name: "Test",
          email: "test@example.com",
          image: null,
          role: "user",
        });

        const result = await verifyOwnership(undefined, VALID_SESSION_ID);

        expect(result.authorized).toBe(true);
        expect(result.currentUserId).toBe("user-123");
      });
    });

    describe("when both userId and sessionId are provided", () => {
      it("should prioritize userId verification (userId takes precedence)", async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: "user-123",
          name: "Test",
          email: "test@example.com",
          image: null,
          role: "user",
        });

        const result = await verifyOwnership("user-123", VALID_SESSION_ID);

        expect(result.authorized).toBe(true);
        expect(result.currentUserId).toBe("user-123");
      });

      it("should return 403 when userId does not match even if sessionId is valid", async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: "user-123",
          name: "Test",
          email: "test@example.com",
          image: null,
          role: "user",
        });

        const result = await verifyOwnership("user-999", VALID_SESSION_ID);

        expect(result.authorized).toBe(false);
        expect(result.error!.status).toBe(403);
      });
    });

    describe("when neither userId nor sessionId is provided", () => {
      it("should return authorized (validation handled by route)", async () => {
        const result = await verifyOwnership(undefined, undefined);

        expect(result.authorized).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should return currentUserId if user is authenticated", async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: "user-123",
          name: "Test",
          email: "test@example.com",
          image: null,
          role: "user",
        });

        const result = await verifyOwnership();

        expect(result.authorized).toBe(true);
        expect(result.currentUserId).toBe("user-123");
      });

      it("should return null currentUserId if not authenticated", async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await verifyOwnership();

        expect(result.authorized).toBe(true);
        expect(result.currentUserId).toBeNull();
      });
    });
  });

  describe("verifyResourceOwnership", () => {
    const VALID_SESSION_A = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
    const VALID_SESSION_B = "a1234567-b89c-4def-9012-345678901234";

    describe("when resource has a userId (user-owned resource)", () => {
      it("should return authorized when authenticated user matches resource owner", async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: "user-123",
          name: "Test",
          email: "test@example.com",
          image: null,
          role: "user",
        });

        const result = await verifyResourceOwnership("user-123", null);

        expect(result.authorized).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should return 403 when authenticated user does not match resource owner", async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: "user-123",
          name: "Test",
          email: "test@example.com",
          image: null,
          role: "user",
        });

        const result = await verifyResourceOwnership("user-999", null);

        expect(result.authorized).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.status).toBe(403);
      });

      it("should return 401 when user is not authenticated but resource has userId", async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await verifyResourceOwnership("user-123", null);

        expect(result.authorized).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.status).toBe(401);
      });

      it("should ignore sessionId when resource has a userId", async () => {
        mockGetCurrentUser.mockResolvedValue({
          id: "user-123",
          name: "Test",
          email: "test@example.com",
          image: null,
          role: "user",
        });

        const result = await verifyResourceOwnership(
          "user-123",
          VALID_SESSION_A,
          VALID_SESSION_A,
        );

        expect(result.authorized).toBe(true);
      });
    });

    describe("when resource has a sessionId (anonymous resource)", () => {
      it("should return authorized when caller session ID matches resource session ID", async () => {
        const result = await verifyResourceOwnership(
          null,
          VALID_SESSION_A,
          VALID_SESSION_A,
        );

        expect(result.authorized).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should return 403 when caller session ID does not match resource session ID", async () => {
        const result = await verifyResourceOwnership(
          null,
          VALID_SESSION_A,
          VALID_SESSION_B,
        );

        expect(result.authorized).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.status).toBe(403);
      });

      it("should return 401 when no caller session ID is provided", async () => {
        const result = await verifyResourceOwnership(
          null,
          VALID_SESSION_A,
          undefined,
        );

        expect(result.authorized).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.status).toBe(401);
      });

      it("should return 401 when caller session ID is null", async () => {
        const result = await verifyResourceOwnership(
          null,
          VALID_SESSION_A,
          null,
        );

        expect(result.authorized).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.status).toBe(401);
      });

      it("should return 400 when caller session ID has invalid format", async () => {
        const result = await verifyResourceOwnership(
          null,
          VALID_SESSION_A,
          "not-a-valid-uuid",
        );

        expect(result.authorized).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.status).toBe(400);
      });
    });

    describe("when resource has neither userId nor sessionId", () => {
      it("should return authorized (edge case, unowned resource)", async () => {
        const result = await verifyResourceOwnership(null, null);

        expect(result.authorized).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should return authorized with undefined values", async () => {
        const result = await verifyResourceOwnership(undefined, undefined);

        expect(result.authorized).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe("getEffectiveIdentifiers", () => {
    it("should return userId when user is authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user-abc",
        name: "Test",
        email: "test@example.com",
        image: null,
        role: "user",
      });

      const result = await getEffectiveIdentifiers();

      expect(result.userId).toBe("user-abc");
      expect(result.sessionId).toBeUndefined();
    });

    it("should return undefined userId when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await getEffectiveIdentifiers();

      expect(result.userId).toBeUndefined();
      expect(result.sessionId).toBeUndefined();
    });

    it("should always return undefined sessionId (client provides session)", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user-123",
        name: "Test",
        email: "test@example.com",
        image: null,
        role: "user",
      });

      const result = await getEffectiveIdentifiers();

      expect(result.sessionId).toBeUndefined();
    });
  });
});
