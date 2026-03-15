/**
 * Tests for /api/journal route
 *
 * Tests CRUD operations for journal entries:
 * - GET: Fetch journal entries (paginated, filterable), tracked remedies
 * - POST: Create a journal entry
 * - PUT: Update a journal entry
 * - DELETE: Delete a journal entry
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockCreateJournalEntry = vi.fn();
const mockUpdateJournalEntry = vi.fn();
const mockDeleteJournalEntry = vi.fn();
const mockGetJournalEntryById = vi.fn();
const mockGetJournalEntries = vi.fn();
const mockGetTrackedRemedies = vi.fn();
const mockPrismaSubscriptionFindUnique = vi.fn();
const mockGetTrialStatus = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/trial", () => ({
  getTrialStatus: (...args: unknown[]) => mockGetTrialStatus(...args),
}));

vi.mock("@/lib/db", () => ({
  createJournalEntry: (...args: unknown[]) => mockCreateJournalEntry(...args),
  updateJournalEntry: (...args: unknown[]) => mockUpdateJournalEntry(...args),
  deleteJournalEntry: (...args: unknown[]) => mockDeleteJournalEntry(...args),
  getJournalEntryById: (...args: unknown[]) => mockGetJournalEntryById(...args),
  getJournalEntries: (...args: unknown[]) => mockGetJournalEntries(...args),
  getTrackedRemedies: (...args: unknown[]) => mockGetTrackedRemedies(...args),
  prisma: {
    subscription: {
      findUnique: (...args: unknown[]) =>
        mockPrismaSubscriptionFindUnique(...args),
    },
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

const authenticatedUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

const mockJournalEntry = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  userId: "user-123",
  remedyId: "550e8400-e29b-41d4-a716-446655440002",
  remedyName: "Turmeric",
  date: "2024-06-15",
  rating: 4,
  symptoms: ["joint pain"],
  sideEffects: [],
  dosageTaken: "500mg",
  notes: "Felt better after taking",
  mood: 4,
  energyLevel: 3,
  sleepQuality: 4,
  createdAt: new Date("2024-06-15"),
  updatedAt: new Date("2024-06-15"),
};

describe("/api/journal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockGetTrialStatus.mockResolvedValue({
      isActive: false,
      isEligible: true,
      hasUsedTrial: false,
      startDate: null,
      endDate: null,
      daysRemaining: 0,
      plan: "basic",
    });
    // Default: user has basic plan (journal access)
    mockPrismaSubscriptionFindUnique.mockResolvedValue({
      plan: "basic",
      status: "active",
    });
  });

  describe("GET /api/journal", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { GET } = await import("@/app/api/journal/route");
      const request = new NextRequest("http://localhost:3000/api/journal");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 403 when user is on free plan", async () => {
      mockGetTrialStatus.mockResolvedValue({
        isActive: false,
        isEligible: true,
        hasUsedTrial: false,
        startDate: null,
        endDate: null,
        daysRemaining: 0,
        plan: "free",
      });
      const { GET } = await import("@/app/api/journal/route");
      const request = new NextRequest("http://localhost:3000/api/journal");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FORBIDDEN");
    });

    it("should return tracked remedies when tracked=true", async () => {
      const mockRemedies = [
        { remedyId: "remedy-1", remedyName: "Turmeric" },
        { remedyId: "remedy-2", remedyName: "Ginger" },
      ];
      mockGetTrackedRemedies.mockResolvedValue(mockRemedies);
      const { GET } = await import("@/app/api/journal/route");
      const request = new NextRequest(
        "http://localhost:3000/api/journal?tracked=true",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.remedies).toEqual(mockRemedies);
      expect(mockGetTrackedRemedies).toHaveBeenCalledWith("user-123");
    });

    it("should return paginated journal entries", async () => {
      const mockResult = {
        entries: [mockJournalEntry],
        total: 1,
        page: 1,
        pageSize: 20,
      };
      mockGetJournalEntries.mockResolvedValue(mockResult);
      const { GET } = await import("@/app/api/journal/route");
      const request = new NextRequest("http://localhost:3000/api/journal");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockGetJournalEntries).toHaveBeenCalledWith(
        "user-123",
        expect.any(Object),
      );
    });

    it("should handle database errors", async () => {
      mockGetJournalEntries.mockRejectedValue(new Error("Database error"));
      const { GET } = await import("@/app/api/journal/route");
      const request = new NextRequest("http://localhost:3000/api/journal");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/journal", () => {
    const validBody = {
      remedyId: "550e8400-e29b-41d4-a716-446655440002",
      remedyName: "Turmeric",
      date: "2024-06-15",
      rating: 4,
      symptoms: ["joint pain"],
      sideEffects: [],
      dosageTaken: "500mg",
      notes: "Felt better after taking",
    };

    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { POST } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 403 when user is on free plan", async () => {
      mockGetTrialStatus.mockResolvedValue({
        isActive: false,
        isEligible: true,
        hasUsedTrial: false,
        startDate: null,
        endDate: null,
        daysRemaining: 0,
        plan: "free",
      });
      const { POST } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FORBIDDEN");
    });

    it("should create a journal entry successfully", async () => {
      mockCreateJournalEntry.mockResolvedValue(mockJournalEntry);
      const { POST } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("Journal entry created");
      expect(mockCreateJournalEntry).toHaveBeenCalledWith(
        "user-123",
        expect.any(Object),
      );
    });

    it("should return 400 for invalid input", async () => {
      const { POST } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "POST",
        body: JSON.stringify({ remedyId: "not-a-uuid" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return 409 for duplicate entry", async () => {
      mockCreateJournalEntry.mockRejectedValue(
        new Error("Unique constraint failed"),
      );
      const { POST } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CONFLICT");
    });

    it("should return 500 on server error", async () => {
      mockCreateJournalEntry.mockRejectedValue(new Error("Unexpected error"));
      const { POST } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("PUT /api/journal", () => {
    const validUpdate = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      rating: 5,
      notes: "Updated notes",
    };

    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { PUT } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "PUT",
        body: JSON.stringify(validUpdate),
        headers: { "Content-Type": "application/json" },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should update a journal entry successfully", async () => {
      mockGetJournalEntryById.mockResolvedValue(mockJournalEntry);
      mockUpdateJournalEntry.mockResolvedValue({
        ...mockJournalEntry,
        rating: 5,
        notes: "Updated notes",
      });
      const { PUT } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "PUT",
        body: JSON.stringify(validUpdate),
        headers: { "Content-Type": "application/json" },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("Journal entry updated");
    });

    it("should return 404 when entry not found", async () => {
      mockGetJournalEntryById.mockResolvedValue(null);
      const { PUT } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "PUT",
        body: JSON.stringify(validUpdate),
        headers: { "Content-Type": "application/json" },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 404 when entry belongs to another user", async () => {
      mockGetJournalEntryById.mockResolvedValue({
        ...mockJournalEntry,
        userId: "other-user",
      });
      const { PUT } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "PUT",
        body: JSON.stringify(validUpdate),
        headers: { "Content-Type": "application/json" },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 400 for invalid input", async () => {
      const { PUT } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "PUT",
        body: JSON.stringify({ id: "not-a-uuid" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return 500 on server error", async () => {
      mockGetJournalEntryById.mockResolvedValue(mockJournalEntry);
      mockUpdateJournalEntry.mockRejectedValue(new Error("Database error"));
      const { PUT } = await import("@/app/api/journal/route");
      const request = new Request("http://localhost:3000/api/journal", {
        method: "PUT",
        body: JSON.stringify(validUpdate),
        headers: { "Content-Type": "application/json" },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("DELETE /api/journal", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { DELETE } = await import("@/app/api/journal/route");
      const request = new NextRequest(
        `http://localhost:3000/api/journal?id=${mockJournalEntry.id}`,
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 400 when id is missing", async () => {
      const { DELETE } = await import("@/app/api/journal/route");
      const request = new NextRequest("http://localhost:3000/api/journal");
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should delete a journal entry successfully", async () => {
      mockGetJournalEntryById.mockResolvedValue(mockJournalEntry);
      mockDeleteJournalEntry.mockResolvedValue(undefined);
      const { DELETE } = await import("@/app/api/journal/route");
      const request = new NextRequest(
        `http://localhost:3000/api/journal?id=${mockJournalEntry.id}`,
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("Journal entry deleted");
      expect(mockDeleteJournalEntry).toHaveBeenCalledWith(mockJournalEntry.id);
    });

    it("should return 404 when entry not found", async () => {
      mockGetJournalEntryById.mockResolvedValue(null);
      const { DELETE } = await import("@/app/api/journal/route");
      const request = new NextRequest(
        `http://localhost:3000/api/journal?id=${mockJournalEntry.id}`,
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 404 when entry belongs to another user", async () => {
      mockGetJournalEntryById.mockResolvedValue({
        ...mockJournalEntry,
        userId: "other-user",
      });
      const { DELETE } = await import("@/app/api/journal/route");
      const request = new NextRequest(
        `http://localhost:3000/api/journal?id=${mockJournalEntry.id}`,
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 500 on server error", async () => {
      mockGetJournalEntryById.mockResolvedValue(mockJournalEntry);
      mockDeleteJournalEntry.mockRejectedValue(new Error("Database error"));
      const { DELETE } = await import("@/app/api/journal/route");
      const request = new NextRequest(
        `http://localhost:3000/api/journal?id=${mockJournalEntry.id}`,
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
