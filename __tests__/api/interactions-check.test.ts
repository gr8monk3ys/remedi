/**
 * Tests for /api/interactions/check route
 *
 * Tests checking pairwise interactions for multiple substances:
 * - POST /api/interactions/check
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the database interaction functions
vi.mock("@/lib/db", () => ({
  checkMultipleInteractions: vi.fn(),
}));

import { checkMultipleInteractions } from "@/lib/db";
import { POST } from "@/app/api/interactions/check/route";

// Shared mock interaction data
const mockInteraction1 = {
  id: "interaction-1",
  substanceA: "Warfarin",
  substanceAType: "pharmaceutical",
  substanceB: "Ginkgo Biloba",
  substanceBType: "supplement",
  severity: "severe",
  description: "Ginkgo may increase bleeding risk when taken with Warfarin",
  mechanism: "Antiplatelet effect",
  recommendation: "Avoid combination",
  evidence: "Moderate clinical evidence",
  sources: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockInteraction2 = {
  id: "interaction-2",
  substanceA: "Warfarin",
  substanceAType: "pharmaceutical",
  substanceB: "St. John's Wort",
  substanceBType: "supplement",
  severity: "contraindicated",
  description: "St. John's Wort drastically reduces Warfarin effectiveness",
  mechanism: "CYP3A4 induction",
  recommendation: "Do not combine",
  evidence: "Strong clinical evidence",
  sources: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("POST /api/interactions/check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Valid requests", () => {
    it("should return interactions for multiple substances", async () => {
      vi.mocked(checkMultipleInteractions).mockResolvedValue([
        mockInteraction2,
        mockInteraction1,
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/interactions/check",
        {
          method: "POST",
          body: JSON.stringify({
            substances: ["Warfarin", "St. John's Wort", "Ginkgo Biloba"],
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.interactions).toHaveLength(2);
      expect(json.data.substancesChecked).toEqual([
        "Warfarin",
        "St. John's Wort",
        "Ginkgo Biloba",
      ]);
      expect(json.data.pairsChecked).toBe(3); // C(3,2) = 3 pairs
      expect(json.data.interactionsFound).toBe(2);
    });

    it("should return empty interactions when no pair interacts", async () => {
      vi.mocked(checkMultipleInteractions).mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/interactions/check",
        {
          method: "POST",
          body: JSON.stringify({
            substances: ["Vitamin C", "Vitamin D"],
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.interactions).toEqual([]);
      expect(json.data.pairsChecked).toBe(1);
      expect(json.data.interactionsFound).toBe(0);
    });

    it("should correctly calculate pairs checked", async () => {
      vi.mocked(checkMultipleInteractions).mockResolvedValue([]);

      const substances = ["A", "B", "C", "D"];
      const request = new NextRequest(
        "http://localhost:3000/api/interactions/check",
        {
          method: "POST",
          body: JSON.stringify({ substances }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const json = await response.json();

      // C(4,2) = 6 pairs
      expect(json.data.pairsChecked).toBe(6);
    });
  });

  describe("Validation errors", () => {
    it("should return 400 when body is not valid JSON", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/interactions/check",
        {
          method: "POST",
          body: "not json",
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 when substances array is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/interactions/check",
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 when fewer than 2 substances are provided", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/interactions/check",
        {
          method: "POST",
          body: JSON.stringify({
            substances: ["OnlyOne"],
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 when more than 20 substances are provided", async () => {
      const substances = Array.from(
        { length: 21 },
        (_, i) => `Substance ${i + 1}`,
      );

      const request = new NextRequest(
        "http://localhost:3000/api/interactions/check",
        {
          method: "POST",
          body: JSON.stringify({ substances }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 when a substance name is empty", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/interactions/check",
        {
          method: "POST",
          body: JSON.stringify({
            substances: ["Warfarin", ""],
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 for substance names with script injection", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/interactions/check",
        {
          method: "POST",
          body: JSON.stringify({
            substances: ["Warfarin", "<script>alert(1)</script>"],
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });
  });

  describe("Error handling", () => {
    it("should return 500 on database error", async () => {
      vi.mocked(checkMultipleInteractions).mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/interactions/check",
        {
          method: "POST",
          body: JSON.stringify({
            substances: ["Warfarin", "Aspirin"],
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("DATABASE_ERROR");
    });
  });
});
