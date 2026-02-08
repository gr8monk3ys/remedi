/**
 * Tests for /api/search route
 *
 * Tests the three-tier search strategy:
 * 1. Database search
 * 2. OpenFDA API fallback
 * 3. Mock data fallback
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/search/route";
import { NextRequest } from "next/server";

// Mock the database functions
vi.mock("@/lib/db", () => ({
  searchPharmaceuticals: vi.fn(),
  getNaturalRemediesForPharmaceutical: vi.fn(),
  upsertPharmaceutical: vi.fn(),
  saveSearchHistory: vi.fn(),
}));

// Mock the OpenFDA API
vi.mock("@/lib/openFDA", () => ({
  searchFdaDrugs: vi.fn(),
}));

// Mock the fuzzy search
vi.mock("@/lib/fuzzy-search", () => ({
  fuzzySearch: vi.fn(),
}));

// Mock the remedy mapping
vi.mock("@/lib/remedyMapping", () => ({
  findNaturalRemediesForDrug: vi.fn().mockResolvedValue([]),
}));

// Mock rate limiting
vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, result: { success: true } }),
  RATE_LIMITS: { search: { limit: 30, window: 60, identifier: "search" } },
}));

import {
  searchPharmaceuticals,
  getNaturalRemediesForPharmaceutical,
  upsertPharmaceutical,
} from "@/lib/db";
import { searchFdaDrugs } from "@/lib/openFDA";
import { fuzzySearch } from "@/lib/fuzzy-search";

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Query Parameter Validation", () => {
    it("should return 400 when query parameter is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/search");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data).toHaveProperty("error");
      // When query param is missing, it will be null and fail with "must be a string"
      expect(data.error.message).toMatch(/string|empty/i);
    });

    it("should return 400 when query parameter is empty", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/search?query=",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data).toHaveProperty("error");
    });

    it("should accept valid query parameters", async () => {
      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockResolvedValue([]);
      vi.mocked(fuzzySearch).mockReturnValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=ibuprofen",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Database Search (Tier 1)", () => {
    it("should return remedies from database when pharmaceutical is found", async () => {
      const mockPharmaceutical = {
        id: "1",
        fdaId: "test-fda-id",
        name: "Ibuprofen",
        description: "Pain reliever",
        category: "Pain Reliever",
        ingredients: ["Ibuprofen"],
        benefits: ["Pain relief", "Anti-inflammatory"],
        usage: "Take with food",
        warnings: "Do not exceed recommended dose",
        interactions: "May interact with blood thinners",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRemedies = [
        {
          id: "remedy-1",
          name: "Turmeric",
          description: "Natural anti-inflammatory",
          category: "Spice",
          imageUrl: "https://example.com/turmeric.jpg",
          matchingNutrients: ["Curcumin"],
          similarityScore: 0.85,
        },
      ];

      vi.mocked(searchPharmaceuticals).mockResolvedValue([mockPharmaceutical]);
      vi.mocked(getNaturalRemediesForPharmaceutical).mockResolvedValue(
        mockRemedies as any,
      );

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=ibuprofen",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0]).toHaveProperty("name", "Turmeric");
      expect(searchPharmaceuticals).toHaveBeenCalledWith("ibuprofen");
      expect(getNaturalRemediesForPharmaceutical).toHaveBeenCalledWith("1");
    });

    it("should handle database returning no results and fallback to FDA API", async () => {
      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockResolvedValue([
        {
          id: "fda-1",
          fdaId: "fda-test",
          name: "Aspirin",
          description: "Pain reliever",
          category: "Pain Reliever",
          ingredients: ["Aspirin"],
          benefits: ["Pain relief"],
        },
      ]);
      vi.mocked(fuzzySearch).mockReturnValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=aspirin",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(searchPharmaceuticals).toHaveBeenCalled();
      expect(searchFdaDrugs).toHaveBeenCalled();
    });
  });

  describe("OpenFDA API Search (Tier 2)", () => {
    it("should use FDA API when database has no results", async () => {
      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockResolvedValue([
        {
          id: "fda-1",
          fdaId: "fda-test-id",
          name: "Melatonin",
          description: "Sleep aid",
          category: "Sleep Aid",
          ingredients: ["Melatonin"],
          benefits: ["Sleep regulation"],
        },
      ]);
      vi.mocked(upsertPharmaceutical).mockResolvedValue({} as any);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=melatonin",
      );
      const response = await GET(request);

      expect(searchFdaDrugs).toHaveBeenCalledWith("melatonin");
      expect(response.status).toBe(200);
    });

    it("should cache FDA results in database", async () => {
      const fdaDrug = {
        id: "fda-1",
        fdaId: "fda-cache-test",
        name: "Vitamin D",
        description: "Vitamin supplement",
        category: "Vitamin",
        ingredients: ["Vitamin D3"],
        benefits: ["Bone health"],
      };

      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockResolvedValue([fdaDrug]);
      vi.mocked(upsertPharmaceutical).mockResolvedValue({} as any);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=vitamin-d",
      );
      await GET(request);

      expect(upsertPharmaceutical).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Vitamin D",
          fdaId: "fda-cache-test",
        }),
      );
    });
  });

  describe("Mock Data Fallback (Tier 3)", () => {
    it("should use fuzzy search on mock data when database and FDA fail", async () => {
      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockResolvedValue([]);
      // Return a properly structured pharmaceutical object
      vi.mocked(fuzzySearch).mockReturnValue([
        {
          id: "1",
          fdaId: "mock-1",
          name: "Vitamin D3 Supplement",
          description: "Helps with calcium absorption",
          category: "Vitamin Supplement",
          ingredients: ["Vitamin D3", "Calcium"],
          benefits: ["Bone health"],
          similarityScore: 0.8,
          searchText: "Vitamin D3 Supplement",
        } as any,
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=unknown-drug",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(fuzzySearch).toHaveBeenCalled();
      expect(Array.isArray(json.data)).toBe(true);
    });

    it("should return empty array when all search tiers fail", async () => {
      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockResolvedValue([]);
      vi.mocked(fuzzySearch).mockReturnValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=nonexistent",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBe(0);
    });
  });

  describe("Query Processing", () => {
    it("should handle queries with common suffixes", async () => {
      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockResolvedValue([]);
      vi.mocked(fuzzySearch).mockReturnValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=ibuprofen+tablet",
      );
      await GET(request);

      // Should call searchPharmaceuticals with processed query (suffix removed)
      expect(searchPharmaceuticals).toHaveBeenCalled();
    });

    it("should normalize query case", async () => {
      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockResolvedValue([]);
      vi.mocked(fuzzySearch).mockReturnValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=IBUPROFEN",
      );
      await GET(request);

      expect(searchPharmaceuticals).toHaveBeenCalledWith("ibuprofen");
    });

    it("should handle spelling variants", async () => {
      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockResolvedValue([]);
      vi.mocked(fuzzySearch).mockReturnValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=ibuprofin",
      );
      await GET(request);

      // Should normalize spelling variants
      expect(searchPharmaceuticals).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should gracefully fall through on database errors", async () => {
      vi.mocked(searchPharmaceuticals).mockRejectedValue(
        new Error("Database error"),
      );
      vi.mocked(searchFdaDrugs).mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=test",
      );
      const response = await GET(request);
      const json = await response.json();

      // Database errors should fall through to FDA API / mock data, not return 500
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it("should handle FDA API errors and return 500", async () => {
      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockRejectedValue(new Error("FDA API error"));

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=test",
      );
      const response = await GET(request);
      const json = await response.json();

      // FDA errors should return 500 with error structure
      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json).toHaveProperty("error");
    });

    it("should return 500 for unexpected errors", async () => {
      vi.mocked(searchPharmaceuticals).mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=test",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json).toHaveProperty("error");
    });
  });

  describe("Response Format", () => {
    it("should return array of remedy objects with correct structure", async () => {
      const mockRemedy = {
        id: "remedy-1",
        name: "Ginger",
        description: "Natural remedy",
        category: "Root",
        imageUrl: "https://example.com/ginger.jpg",
        matchingNutrients: ["Gingerol"],
        similarityScore: 0.9,
      };

      vi.mocked(searchPharmaceuticals).mockResolvedValue([
        {
          id: "1",
          name: "Test",
          category: "Test",
          ingredients: [],
          benefits: [],
        } as any,
      ]);
      vi.mocked(getNaturalRemediesForPharmaceutical).mockResolvedValue([
        mockRemedy,
      ] as any);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=test",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data[0]).toHaveProperty("id");
      expect(json.data[0]).toHaveProperty("name");
      expect(json.data[0]).toHaveProperty("description");
      expect(json.data[0]).toHaveProperty("category");
      expect(json.data[0]).toHaveProperty("similarityScore");
    });

    it("should include metadata in response", async () => {
      vi.mocked(searchPharmaceuticals).mockResolvedValue([]);
      vi.mocked(searchFdaDrugs).mockResolvedValue([]);
      vi.mocked(fuzzySearch).mockReturnValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/search?query=test",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json).toHaveProperty("metadata");
      expect(json.metadata).toHaveProperty("total");
      expect(json.metadata).toHaveProperty("processingTime");
      expect(json.metadata).toHaveProperty("apiVersion");
    });
  });
});
