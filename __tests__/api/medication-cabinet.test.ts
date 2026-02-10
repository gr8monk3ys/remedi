/**
 * Tests for /api/medication-cabinet route
 *
 * Tests CRUD operations for medication cabinet:
 * - GET: Fetch all medications
 * - POST: Add a medication (with plan limits)
 * - PUT: Update a medication
 * - DELETE: Remove a medication
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockGetMedications = vi.fn();
const mockGetMedicationById = vi.fn();
const mockAddMedication = vi.fn();
const mockUpdateMedication = vi.fn();
const mockRemoveMedication = vi.fn();
const mockCountMedications = vi.fn();
const mockPrismaSubscriptionFindUnique = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db", () => ({
  getMedications: (...args: unknown[]) => mockGetMedications(...args),
  getMedicationById: (...args: unknown[]) => mockGetMedicationById(...args),
  addMedication: (...args: unknown[]) => mockAddMedication(...args),
  updateMedication: (...args: unknown[]) => mockUpdateMedication(...args),
  removeMedication: (...args: unknown[]) => mockRemoveMedication(...args),
  countMedications: (...args: unknown[]) => mockCountMedications(...args),
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

const mockMedication = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  userId: "user-123",
  name: "Ibuprofen",
  type: "pharmaceutical",
  dosage: "200mg",
  frequency: "as_needed",
  startDate: null,
  notes: "For headaches",
  isActive: true,
  createdAt: new Date("2024-06-15"),
  updatedAt: new Date("2024-06-15"),
};

describe("/api/medication-cabinet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    // Default: user has basic plan
    mockPrismaSubscriptionFindUnique.mockResolvedValue({
      plan: "basic",
      status: "active",
    });
  });

  describe("GET /api/medication-cabinet", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { GET } = await import("@/app/api/medication-cabinet/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return medications list", async () => {
      mockGetMedications.mockResolvedValue([mockMedication]);
      const { GET } = await import("@/app/api/medication-cabinet/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.medications).toHaveLength(1);
      expect(data.data.count).toBe(1);
      expect(mockGetMedications).toHaveBeenCalledWith("user-123");
    });

    it("should return empty list when no medications", async () => {
      mockGetMedications.mockResolvedValue([]);
      const { GET } = await import("@/app/api/medication-cabinet/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.medications).toHaveLength(0);
      expect(data.data.count).toBe(0);
    });

    it("should return 500 on server error", async () => {
      mockGetMedications.mockRejectedValue(new Error("Database error"));
      const { GET } = await import("@/app/api/medication-cabinet/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/medication-cabinet", () => {
    const validBody = {
      name: "Ibuprofen",
      type: "pharmaceutical",
      dosage: "200mg",
      frequency: "as_needed",
      isActive: true,
    };

    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { POST } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 403 when medication limit exceeded", async () => {
      mockCountMedications.mockResolvedValue(20); // Basic plan allows 20
      const { POST } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FORBIDDEN");
    });

    it("should add medication successfully", async () => {
      mockCountMedications.mockResolvedValue(5);
      mockAddMedication.mockResolvedValue(mockMedication);
      const { POST } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("Medication added");
      expect(mockAddMedication).toHaveBeenCalledWith(
        "user-123",
        expect.any(Object),
      );
    });

    it("should return 400 for invalid input", async () => {
      mockCountMedications.mockResolvedValue(0);
      const { POST } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "POST",
          body: JSON.stringify({ name: "" }),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 for invalid medication type", async () => {
      mockCountMedications.mockResolvedValue(0);
      const { POST } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "POST",
          body: JSON.stringify({ ...validBody, type: "invalid_type" }),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return 409 for duplicate medication", async () => {
      mockCountMedications.mockResolvedValue(0);
      mockAddMedication.mockRejectedValue(
        new Error("Unique constraint failed"),
      );
      const { POST } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CONFLICT");
    });

    it("should return 500 on server error", async () => {
      mockCountMedications.mockResolvedValue(0);
      mockAddMedication.mockRejectedValue(new Error("Unexpected error"));
      const { POST } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("PUT /api/medication-cabinet", () => {
    const validUpdate = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      dosage: "400mg",
      notes: "Updated dosage",
    };

    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { PUT } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "PUT",
          body: JSON.stringify(validUpdate),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should update medication successfully", async () => {
      mockGetMedicationById.mockResolvedValue(mockMedication);
      mockUpdateMedication.mockResolvedValue({
        ...mockMedication,
        dosage: "400mg",
      });
      const { PUT } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "PUT",
          body: JSON.stringify(validUpdate),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("Medication updated");
    });

    it("should return 404 when medication not found", async () => {
      mockGetMedicationById.mockResolvedValue(null);
      const { PUT } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "PUT",
          body: JSON.stringify(validUpdate),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 404 when medication belongs to another user", async () => {
      mockGetMedicationById.mockResolvedValue({
        ...mockMedication,
        userId: "other-user",
      });
      const { PUT } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "PUT",
          body: JSON.stringify(validUpdate),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 400 for invalid input", async () => {
      const { PUT } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "PUT",
          body: JSON.stringify({ id: "not-a-uuid" }),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return 500 on server error", async () => {
      mockGetMedicationById.mockResolvedValue(mockMedication);
      mockUpdateMedication.mockRejectedValue(new Error("Database error"));
      const { PUT } = await import("@/app/api/medication-cabinet/route");
      const request = new Request(
        "http://localhost:3000/api/medication-cabinet",
        {
          method: "PUT",
          body: JSON.stringify(validUpdate),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("DELETE /api/medication-cabinet", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { DELETE } = await import("@/app/api/medication-cabinet/route");
      const request = new NextRequest(
        `http://localhost:3000/api/medication-cabinet?id=${mockMedication.id}`,
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 400 when id is missing", async () => {
      const { DELETE } = await import("@/app/api/medication-cabinet/route");
      const request = new NextRequest(
        "http://localhost:3000/api/medication-cabinet",
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should delete medication successfully", async () => {
      mockGetMedicationById.mockResolvedValue(mockMedication);
      mockRemoveMedication.mockResolvedValue(undefined);
      const { DELETE } = await import("@/app/api/medication-cabinet/route");
      const request = new NextRequest(
        `http://localhost:3000/api/medication-cabinet?id=${mockMedication.id}`,
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("Medication removed");
      expect(mockRemoveMedication).toHaveBeenCalledWith(mockMedication.id);
    });

    it("should return 404 when medication not found", async () => {
      mockGetMedicationById.mockResolvedValue(null);
      const { DELETE } = await import("@/app/api/medication-cabinet/route");
      const request = new NextRequest(
        `http://localhost:3000/api/medication-cabinet?id=${mockMedication.id}`,
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 404 when medication belongs to another user", async () => {
      mockGetMedicationById.mockResolvedValue({
        ...mockMedication,
        userId: "other-user",
      });
      const { DELETE } = await import("@/app/api/medication-cabinet/route");
      const request = new NextRequest(
        `http://localhost:3000/api/medication-cabinet?id=${mockMedication.id}`,
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 500 on server error", async () => {
      mockGetMedicationById.mockResolvedValue(mockMedication);
      mockRemoveMedication.mockRejectedValue(new Error("Database error"));
      const { DELETE } = await import("@/app/api/medication-cabinet/route");
      const request = new NextRequest(
        `http://localhost:3000/api/medication-cabinet?id=${mockMedication.id}`,
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
