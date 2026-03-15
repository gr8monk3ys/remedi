/**
 * Tests for /api/email-preferences route
 *
 * Tests email preference management:
 * - GET /api/email-preferences - Fetch user email preferences
 * - PATCH /api/email-preferences - Update user email preferences
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock database
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockUpsert = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    emailPreference: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}));

// Mock auth
const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

import { GET, PATCH } from "@/app/api/email-preferences/route";

const mockUser = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  image: null,
  role: "user",
};

const mockPreferences = {
  id: "pref-1",
  weeklyDigest: true,
  marketingEmails: false,
  productUpdates: true,
  subscriptionReminders: true,
  updatedAt: new Date("2024-01-01"),
};

describe("/api/email-preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/email-preferences", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("should return existing email preferences for authenticated user", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockFindUnique.mockResolvedValue(mockPreferences);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.weeklyDigest).toBe(true);
      expect(json.data.marketingEmails).toBe(false);
      expect(json.data.productUpdates).toBe(true);
      expect(json.data.subscriptionReminders).toBe(true);
      expect(mockFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-123" },
        }),
      );
    });

    it("should create default preferences when none exist", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockPreferences);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-123",
            weeklyDigest: true,
            marketingEmails: false,
            productUpdates: true,
            subscriptionReminders: true,
          }),
        }),
      );
    });

    it("should return 500 on database error", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockFindUnique.mockRejectedValue(new Error("Database error"));

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("PATCH /api/email-preferences", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/email-preferences",
        {
          method: "PATCH",
          body: JSON.stringify({ weeklyDigest: false }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("should update email preferences", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      const updatedPrefs = { ...mockPreferences, weeklyDigest: false };
      mockUpsert.mockResolvedValue(updatedPrefs);

      const request = new NextRequest(
        "http://localhost:3000/api/email-preferences",
        {
          method: "PATCH",
          body: JSON.stringify({ weeklyDigest: false }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-123" },
          update: { weeklyDigest: false },
        }),
      );
    });

    it("should allow updating multiple fields at once", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      const updatedPrefs = {
        ...mockPreferences,
        weeklyDigest: false,
        marketingEmails: true,
      };
      mockUpsert.mockResolvedValue(updatedPrefs);

      const request = new NextRequest(
        "http://localhost:3000/api/email-preferences",
        {
          method: "PATCH",
          body: JSON.stringify({
            weeklyDigest: false,
            marketingEmails: true,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { weeklyDigest: false, marketingEmails: true },
        }),
      );
    });

    it("should return 400 when no fields are provided", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const request = new NextRequest(
        "http://localhost:3000/api/email-preferences",
        {
          method: "PATCH",
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 for invalid field values", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const request = new NextRequest(
        "http://localhost:3000/api/email-preferences",
        {
          method: "PATCH",
          body: JSON.stringify({ weeklyDigest: "not-a-boolean" }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should return 500 on database error during update", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockUpsert.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/email-preferences",
        {
          method: "PATCH",
          body: JSON.stringify({ weeklyDigest: false }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
