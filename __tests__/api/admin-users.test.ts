/**
 * Tests for /api/admin/users/[id] route
 *
 * Tests admin user management:
 * - PATCH: Update user role/name (admin only)
 * - DELETE: Delete user (admin only)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockIsAdmin = vi.fn();
const mockPrismaUserUpdate = vi.fn();
const mockPrismaUserDelete = vi.fn();
const mockWithRateLimit = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  isAdmin: () => mockIsAdmin(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      update: (...args: unknown[]) => mockPrismaUserUpdate(...args),
      delete: (...args: unknown[]) => mockPrismaUserDelete(...args),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: {
    adminActions: { limit: 20, window: 60, identifier: "admin-actions" },
  },
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

const adminUser = {
  id: "admin-123",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
};
const targetUser = {
  id: "user-456",
  email: "user@example.com",
  name: "Regular User",
  role: "user",
  updatedAt: new Date("2024-06-15"),
};

function makePatchRequest(
  id: string,
  body: Record<string, unknown>,
): [NextRequest, { params: Promise<{ id: string }> }] {
  const request = new NextRequest(
    `http://localhost:3000/api/admin/users/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    },
  );
  return [request, { params: Promise.resolve({ id }) }];
}

function makeDeleteRequest(
  id: string,
): [NextRequest, { params: Promise<{ id: string }> }] {
  const request = new NextRequest(
    `http://localhost:3000/api/admin/users/${id}`,
    { method: "DELETE" },
  );
  return [request, { params: Promise.resolve({ id }) }];
}

describe("PATCH /api/admin/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(adminUser);
    mockIsAdmin.mockResolvedValue(true);
    mockWithRateLimit.mockResolvedValue({ allowed: true, response: null });
  });

  describe("authorization", () => {
    it("should return 403 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockIsAdmin.mockResolvedValue(false);
      const { PATCH } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makePatchRequest("user-456", {
        role: "admin",
      });
      const response = await PATCH(request, context);
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 403 when a non-admin user attempts to update", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user-999", role: "user" });
      mockIsAdmin.mockResolvedValue(false);
      const { PATCH } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makePatchRequest("user-456", {
        role: "admin",
      });
      const response = await PATCH(request, context);
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("role changes", () => {
    it("should allow admin to promote another user to admin", async () => {
      mockPrismaUserUpdate.mockResolvedValue({ ...targetUser, role: "admin" });
      const { PATCH } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makePatchRequest("user-456", {
        role: "admin",
      });
      const response = await PATCH(request, context);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.role).toBe("admin");
      expect(mockPrismaUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-456" },
          data: expect.objectContaining({ role: "admin" }),
        }),
      );
    });

    it("should allow admin to demote another user to regular user", async () => {
      mockPrismaUserUpdate.mockResolvedValue({ ...targetUser, role: "user" });
      const { PATCH } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makePatchRequest("user-456", { role: "user" });
      const response = await PATCH(request, context);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.role).toBe("user");
    });
  });

  describe("self-demotion prevention", () => {
    it("should return 403 when admin tries to demote themselves", async () => {
      const { PATCH } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makePatchRequest("admin-123", {
        role: "user",
      });
      const response = await PATCH(request, context);
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FORBIDDEN");
      expect(data.error.message).toContain("demote");
    });

    it("should allow admin to update their own name without triggering self-demotion", async () => {
      mockPrismaUserUpdate.mockResolvedValue({
        ...adminUser,
        name: "Updated Admin Name",
      });
      const { PATCH } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makePatchRequest("admin-123", {
        name: "Updated Admin Name",
      });
      const response = await PATCH(request, context);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("input validation", () => {
    it("should return 400 for an invalid role value", async () => {
      const { PATCH } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makePatchRequest("user-456", {
        role: "superadmin",
      });
      const response = await PATCH(request, context);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 when name is an empty string", async () => {
      const { PATCH } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makePatchRequest("user-456", { name: "" });
      const response = await PATCH(request, context);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });
  });

  describe("error handling", () => {
    it("should return 500 when Prisma throws during update", async () => {
      mockPrismaUserUpdate.mockRejectedValue(
        new Error("Database connection lost"),
      );
      const { PATCH } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makePatchRequest("user-456", {
        role: "admin",
      });
      const response = await PATCH(request, context);
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});

describe("DELETE /api/admin/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(adminUser);
    mockIsAdmin.mockResolvedValue(true);
    mockWithRateLimit.mockResolvedValue({ allowed: true, response: null });
  });

  describe("authorization", () => {
    it("should return 403 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockIsAdmin.mockResolvedValue(false);
      const { DELETE } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makeDeleteRequest("user-456");
      const response = await DELETE(request, context);
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 403 when a non-admin user attempts delete", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user-999", role: "user" });
      mockIsAdmin.mockResolvedValue(false);
      const { DELETE } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makeDeleteRequest("user-456");
      const response = await DELETE(request, context);
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });

  describe("self-deletion prevention", () => {
    it("should return 403 when admin tries to delete themselves", async () => {
      const { DELETE } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makeDeleteRequest("admin-123");
      const response = await DELETE(request, context);
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FORBIDDEN");
      expect(data.error.message).toContain("yourself");
    });
  });

  describe("successful deletion", () => {
    it("should allow admin to delete another user", async () => {
      mockPrismaUserDelete.mockResolvedValue(targetUser);
      const { DELETE } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makeDeleteRequest("user-456");
      const response = await DELETE(request, context);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("deleted");
      expect(mockPrismaUserDelete).toHaveBeenCalledWith({
        where: { id: "user-456" },
      });
    });
  });

  describe("error handling", () => {
    it("should return 500 when database delete fails", async () => {
      mockPrismaUserDelete.mockRejectedValue(new Error("Database error"));
      const { DELETE } = await import("@/app/api/admin/users/[id]/route");
      const [request, context] = makeDeleteRequest("user-456");
      const response = await DELETE(request, context);
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
