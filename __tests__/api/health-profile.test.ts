/**
 * Tests for /api/health-profile route
 *
 * Tests profile retrieval and upsert behavior.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockGetHealthProfile = vi.fn();
const mockUpsertHealthProfile = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

vi.mock("@/lib/db", () => ({
  getHealthProfile: (...args: unknown[]) => mockGetHealthProfile(...args),
  upsertHealthProfile: (...args: unknown[]) => mockUpsertHealthProfile(...args),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

import { GET, PUT } from "@/app/api/health-profile/route";

const authenticatedUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

describe("/api/health-profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
  });

  describe("GET /api/health-profile", () => {
    it("should return 401 when unauthenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return default empty profile when none exists", async () => {
      mockGetHealthProfile.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.profile).toEqual({
        categories: [],
        goals: [],
        allergies: [],
        conditions: [],
        dietaryPrefs: [],
      });
    });

    it("should return the existing profile", async () => {
      const profile = {
        id: "profile-1",
        userId: "user-123",
        categories: ["Sleep"],
        goals: ["Reduce pharma"],
        allergies: ["Peanuts"],
        conditions: ["Insomnia"],
        dietaryPrefs: ["Vegan"],
      };
      mockGetHealthProfile.mockResolvedValue(profile);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.profile).toEqual(profile);
      expect(mockGetHealthProfile).toHaveBeenCalledWith("user-123");
    });

    it("should return 500 on database failure", async () => {
      mockGetHealthProfile.mockRejectedValue(new Error("DB failure"));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("PUT /api/health-profile", () => {
    const validBody = {
      categories: ["Sleep", "Stress"],
      goals: ["Reduce pharma"],
      allergies: ["None"],
      conditions: ["Insomnia"],
      dietaryPrefs: ["Vegetarian"],
    };

    it("should return 401 when unauthenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/health-profile", {
        method: "PUT",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 400 for invalid body", async () => {
      const request = new Request("http://localhost:3000/api/health-profile", {
        method: "PUT",
        body: JSON.stringify({
          categories: Array.from({ length: 21 }, () => "x"),
        }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should upsert and return the profile", async () => {
      const upserted = { id: "profile-1", userId: "user-123", ...validBody };
      mockUpsertHealthProfile.mockResolvedValue(upserted);

      const request = new Request("http://localhost:3000/api/health-profile", {
        method: "PUT",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe("Health profile updated");
      expect(data.data.profile).toEqual(upserted);
      expect(mockUpsertHealthProfile).toHaveBeenCalledWith(
        "user-123",
        validBody,
      );
    });

    it("should return 500 on upsert failure", async () => {
      mockUpsertHealthProfile.mockRejectedValue(new Error("DB failure"));

      const request = new Request("http://localhost:3000/api/health-profile", {
        method: "PUT",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
