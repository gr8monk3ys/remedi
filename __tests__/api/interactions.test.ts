/**
 * Tests for /api/interactions route
 *
 * Tests finding drug interactions by substance name and checking pairs:
 * - GET /api/interactions?substance=<name>
 * - GET /api/interactions?check=substance1,substance2
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the database interaction functions
vi.mock("@/lib/db", () => ({
  findInteractionsBySubstance: vi.fn(),
  checkPairInteraction: vi.fn(),
}));

import { findInteractionsBySubstance, checkPairInteraction } from "@/lib/db";
import { GET } from "@/app/api/interactions/route";

// Shared mock interaction data
const mockInteraction = {
  id: "interaction-1",
  substanceA: "Warfarin",
  substanceAType: "pharmaceutical",
  substanceB: "St. John's Wort",
  substanceBType: "supplement",
  severity: "severe",
  description: "St. John's Wort can reduce the effectiveness of Warfarin",
  mechanism: "CYP3A4 enzyme induction",
  recommendation: "Avoid combination",
  evidence: "Strong clinical evidence",
  sources: ["https://pubmed.example.com/12345"],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("GET /api/interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Missing parameters", () => {
    it("should return 400 when neither substance nor check parameter is provided", async () => {
      const request = new NextRequest("http://localhost:3000/api/interactions");
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("MISSING_PARAMETER");
    });
  });

  describe("substance parameter (find all interactions)", () => {
    it("should return interactions for a valid substance", async () => {
      vi.mocked(findInteractionsBySubstance).mockResolvedValue([
        mockInteraction,
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/interactions?substance=Warfarin",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].substanceA).toBe("Warfarin");
      expect(json.metadata.total).toBe(1);
      expect(findInteractionsBySubstance).toHaveBeenCalledWith("Warfarin");
    });

    it("should return empty array when no interactions found", async () => {
      vi.mocked(findInteractionsBySubstance).mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/interactions?substance=Water",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
      expect(json.metadata.total).toBe(0);
    });

    it("should return 400 for empty substance parameter", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/interactions?substance=",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("MISSING_PARAMETER");
    });

    it("should return 400 for substance with script injection", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/interactions?substance=<script>alert(1)</script>",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should include cache headers in response", async () => {
      vi.mocked(findInteractionsBySubstance).mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/interactions?substance=Aspirin",
      );
      const response = await GET(request);

      expect(response.headers.get("Cache-Control")).toContain("s-maxage");
    });
  });

  describe("check parameter (pair interaction check)", () => {
    it("should return interaction when pair is found", async () => {
      vi.mocked(checkPairInteraction).mockResolvedValue(mockInteraction);

      const request = new NextRequest(
        "http://localhost:3000/api/interactions?check=Warfarin,St. John's Wort",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].severity).toBe("severe");
      expect(json.metadata.total).toBe(1);
    });

    it("should return empty array when no pair interaction found", async () => {
      vi.mocked(checkPairInteraction).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/interactions?check=Aspirin,Vitamin C",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
      expect(json.metadata.total).toBe(0);
    });

    it("should return 400 when check parameter has no comma", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/interactions?check=WarfarinOnly",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 when check parameter has only one substance", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/interactions?check=Warfarin,",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });
  });

  describe("Error handling", () => {
    it("should return 500 on database error for substance query", async () => {
      vi.mocked(findInteractionsBySubstance).mockRejectedValue(
        new Error("Database connection lost"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/interactions?substance=Warfarin",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("DATABASE_ERROR");
    });

    it("should return 500 on database error for pair check", async () => {
      vi.mocked(checkPairInteraction).mockRejectedValue(
        new Error("Database timeout"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/interactions?check=Warfarin,Aspirin",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("DATABASE_ERROR");
    });
  });
});
