/**
 * Tests for /api/admin/moderation/[id] route
 *
 * Tests moderation actions:
 * - PATCH: Approve/reject contributions and reviews (admin/moderator only)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockIsAdmin = vi.fn();
const mockIsModerator = vi.fn();
const mockPrismaContributionFindUnique = vi.fn();
const mockPrismaContributionUpdate = vi.fn();
const mockPrismaRemedyCreate = vi.fn();
const mockPrismaReviewUpdate = vi.fn();
const mockPrismaReviewDelete = vi.fn();
const mockSendContributionApproved = vi.fn();
const mockSendContributionRejected = vi.fn();
const mockGetEmailUrl = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  isAdmin: () => mockIsAdmin(),
  isModerator: () => mockIsModerator(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    remedyContribution: {
      findUnique: (...args: unknown[]) =>
        mockPrismaContributionFindUnique(...args),
      update: (...args: unknown[]) => mockPrismaContributionUpdate(...args),
    },
    naturalRemedy: {
      create: (...args: unknown[]) => mockPrismaRemedyCreate(...args),
    },
    remedyReview: {
      update: (...args: unknown[]) => mockPrismaReviewUpdate(...args),
      delete: (...args: unknown[]) => mockPrismaReviewDelete(...args),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendContributionApproved: (...args: unknown[]) =>
    mockSendContributionApproved(...args),
  sendContributionRejected: (...args: unknown[]) =>
    mockSendContributionRejected(...args),
}));

vi.mock("@/lib/email/config", () => ({
  getEmailUrl: (...args: unknown[]) => mockGetEmailUrl(...args),
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

const mockContribution = {
  id: "contrib-1",
  userId: "user-123",
  name: "Chamomile Tea",
  description: "A soothing herbal tea",
  category: "Herbal Remedy",
  ingredients: ["chamomile flowers"],
  benefits: ["relaxation"],
  usage: "Steep for 5 minutes",
  dosage: "1 cup daily",
  precautions: null,
  scientificInfo: null,
  references: [],
  imageUrl: null,
  status: "pending",
  user: {
    id: "user-123",
    email: "user@example.com",
    name: "Test User",
  },
  createdAt: new Date("2024-06-15"),
  updatedAt: new Date("2024-06-15"),
};

function makeRequest(
  id: string,
  body: Record<string, unknown>,
): [NextRequest, { params: Promise<{ id: string }> }] {
  const request = new NextRequest(
    `http://localhost:3000/api/admin/moderation/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    },
  );
  return [request, { params: Promise.resolve({ id }) }];
}

describe("PATCH /api/admin/moderation/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(adminUser);
    mockIsAdmin.mockResolvedValue(true);
    mockIsModerator.mockResolvedValue(false);
    mockSendContributionApproved.mockResolvedValue(undefined);
    mockSendContributionRejected.mockResolvedValue(undefined);
    mockGetEmailUrl.mockReturnValue("http://localhost:3000/remedy/test");
  });

  describe("authorization", () => {
    it("should return 403 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockIsAdmin.mockResolvedValue(false);
      mockIsModerator.mockResolvedValue(false);
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "approve",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 403 when user is not admin or moderator", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user-123",
        role: "user",
      });
      mockIsAdmin.mockResolvedValue(false);
      mockIsModerator.mockResolvedValue(false);
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "approve",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it("should allow moderator to perform actions", async () => {
      mockIsAdmin.mockResolvedValue(false);
      mockIsModerator.mockResolvedValue(true);
      mockPrismaContributionFindUnique.mockResolvedValue(mockContribution);
      mockPrismaRemedyCreate.mockResolvedValue({ id: "new-remedy-1" });
      mockPrismaContributionUpdate.mockResolvedValue({
        ...mockContribution,
        status: "approved",
      });
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "approve",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("input validation", () => {
    it("should return 400 for invalid type", async () => {
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "invalid",
        action: "approve",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 for invalid action", async () => {
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "delete",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });
  });

  describe("contribution approval", () => {
    it("should approve a contribution and create remedy", async () => {
      mockPrismaContributionFindUnique.mockResolvedValue(mockContribution);
      mockPrismaRemedyCreate.mockResolvedValue({ id: "new-remedy-1" });
      mockPrismaContributionUpdate.mockResolvedValue({
        ...mockContribution,
        status: "approved",
      });
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "approve",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("approved");
      expect(mockPrismaRemedyCreate).toHaveBeenCalled();
      expect(mockPrismaContributionUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "approved",
            moderatedBy: "admin-123",
          }),
        }),
      );
    });

    it("should send approval email to contributor", async () => {
      mockPrismaContributionFindUnique.mockResolvedValue(mockContribution);
      mockPrismaRemedyCreate.mockResolvedValue({ id: "new-remedy-1" });
      mockPrismaContributionUpdate.mockResolvedValue({
        ...mockContribution,
        status: "approved",
      });
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "approve",
      });
      await PATCH(request, context);

      expect(mockSendContributionApproved).toHaveBeenCalledWith(
        "user@example.com",
        expect.objectContaining({
          name: "Test User",
          remedyName: "Chamomile Tea",
        }),
        "user-123",
      );
    });

    it("should return 404 when contribution not found", async () => {
      mockPrismaContributionFindUnique.mockResolvedValue(null);
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("nonexistent", {
        type: "contribution",
        action: "approve",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 409 when contribution already moderated", async () => {
      mockPrismaContributionFindUnique.mockResolvedValue({
        ...mockContribution,
        status: "approved",
      });
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "approve",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CONFLICT");
    });

    it("should not fail if approval email fails", async () => {
      mockPrismaContributionFindUnique.mockResolvedValue(mockContribution);
      mockPrismaRemedyCreate.mockResolvedValue({ id: "new-remedy-1" });
      mockPrismaContributionUpdate.mockResolvedValue({
        ...mockContribution,
        status: "approved",
      });
      mockSendContributionApproved.mockRejectedValue(new Error("Email failed"));
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "approve",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      // Should still succeed even if email fails
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("contribution rejection", () => {
    it("should reject a contribution", async () => {
      mockPrismaContributionFindUnique.mockResolvedValue(mockContribution);
      mockPrismaContributionUpdate.mockResolvedValue({
        ...mockContribution,
        status: "rejected",
      });
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "reject",
        note: "Insufficient evidence",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("rejected");
      expect(mockPrismaContributionUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "rejected",
            moderatorNote: "Insufficient evidence",
          }),
        }),
      );
    });

    it("should send rejection email to contributor", async () => {
      mockPrismaContributionFindUnique.mockResolvedValue(mockContribution);
      mockPrismaContributionUpdate.mockResolvedValue({
        ...mockContribution,
        status: "rejected",
      });
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "reject",
        note: "Not enough info",
      });
      await PATCH(request, context);

      expect(mockSendContributionRejected).toHaveBeenCalledWith(
        "user@example.com",
        expect.objectContaining({
          name: "Test User",
          remedyName: "Chamomile Tea",
          moderatorNote: "Not enough info",
        }),
        "user-123",
      );
    });

    it("should return 404 when contribution not found for rejection", async () => {
      mockPrismaContributionFindUnique.mockResolvedValue(null);
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("nonexistent", {
        type: "contribution",
        action: "reject",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 409 when rejecting already moderated contribution", async () => {
      mockPrismaContributionFindUnique.mockResolvedValue({
        ...mockContribution,
        status: "rejected",
      });
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "reject",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CONFLICT");
    });
  });

  describe("review moderation", () => {
    it("should approve (verify) a review", async () => {
      mockPrismaReviewUpdate.mockResolvedValue({
        id: "review-1",
        verified: true,
      });
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("review-1", {
        type: "review",
        action: "approve",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("verified");
      expect(mockPrismaReviewUpdate).toHaveBeenCalledWith({
        where: { id: "review-1" },
        data: { verified: true },
      });
    });

    it("should reject (delete) a review", async () => {
      mockPrismaReviewDelete.mockResolvedValue({ id: "review-1" });
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("review-1", {
        type: "review",
        action: "reject",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("removed");
      expect(mockPrismaReviewDelete).toHaveBeenCalledWith({
        where: { id: "review-1" },
      });
    });
  });

  describe("error handling", () => {
    it("should return 500 on server error", async () => {
      mockPrismaContributionFindUnique.mockRejectedValue(
        new Error("Database error"),
      );
      const { PATCH } = await import("@/app/api/admin/moderation/[id]/route");
      const [request, context] = makeRequest("contrib-1", {
        type: "contribution",
        action: "approve",
      });
      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
