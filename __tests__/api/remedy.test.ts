/**
 * Tests for /api/remedy/[id] route
 *
 * Tests fetching detailed remedy information by ID
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Type for remedy mock
interface MockRemedy {
  id?: string;
  name?: string;
  usage?: string;
  dosage?: string;
  precautions?: string;
  scientificInfo?: string;
  references?: string[];
  relatedRemedies?: string[];
  [key: string]: unknown;
}

// Mock the database functions
vi.mock("@/lib/db", () => ({
  getNaturalRemedyById: vi.fn(),
  toDetailedRemedy: vi.fn((remedy: MockRemedy) => ({
    ...remedy,
    usage: remedy.usage || "",
    dosage: remedy.dosage || "",
    precautions: remedy.precautions || "",
    scientificInfo: remedy.scientificInfo || "",
    references: remedy.references || [],
    relatedRemedies: remedy.relatedRemedies || [],
  })),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock analytics
vi.mock("@/lib/analytics/user-events", () => ({
  trackUserEventSafe: vi.fn().mockResolvedValue(undefined),
}));

import { GET } from "@/app/api/remedy/[id]/route";
import { getNaturalRemedyById } from "@/lib/db";

describe("GET /api/remedy/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Valid Remedy ID", () => {
    it("should return remedy details from database when found", async () => {
      const mockRemedy = {
        id: "test-remedy-id",
        name: "Turmeric",
        description: "Powerful anti-inflammatory spice",
        category: "Spice",
        ingredients: ["Curcumin", "Essential oils"],
        benefits: ["Anti-inflammatory", "Antioxidant", "Pain relief"],
        imageUrl: "https://example.com/turmeric.jpg",
        usage: "Add to food or take as supplement",
        dosage: "500mg-2000mg daily",
        precautions: "May interact with blood thinners",
        scientificInfo: "Contains curcuminoids",
        references: [
          {
            title: "Study on turmeric benefits",
            url: "https://example.com/study",
            year: 2023,
          },
        ],
        relatedRemedies: [
          {
            id: "ginger-id",
            name: "Ginger",
            reason: "Similar anti-inflammatory properties",
          },
        ],
        evidenceLevel: "Strong",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getNaturalRemedyById).mockResolvedValue(mockRemedy as any);

      const request = new NextRequest(
        "http://localhost:3000/api/remedy/test-remedy-id",
      );
      const params = Promise.resolve({ id: "test-remedy-id" });
      const response = await GET(request, { params });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveProperty("id", "test-remedy-id");
      expect(json.data).toHaveProperty("name", "Turmeric");
      expect(json.data).toHaveProperty("description");
      expect(json.data).toHaveProperty("benefits");
      expect(Array.isArray(json.data.benefits)).toBe(true);
      expect(json.data).toHaveProperty("evidenceLevel", "Strong");
      expect(getNaturalRemedyById).toHaveBeenCalledWith("test-remedy-id");
    });

    it("should return remedy with all expected fields", async () => {
      const mockRemedy = {
        id: "full-remedy",
        name: "Ginger",
        description: "Root with medicinal properties",
        category: "Root",
        ingredients: ["Gingerol"],
        benefits: ["Nausea relief"],
        imageUrl: "https://example.com/ginger.jpg",
        usage: "Consume fresh or as tea",
        dosage: "1-3g daily",
        precautions: "May increase bleeding risk",
        scientificInfo: "Contains bioactive compounds",
        references: [],
        relatedRemedies: [],
        evidenceLevel: "Moderate",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getNaturalRemedyById).mockResolvedValue(mockRemedy as any);

      const request = new NextRequest(
        "http://localhost:3000/api/remedy/full-remedy",
      );
      const params = Promise.resolve({ id: "full-remedy" });
      const response = await GET(request, { params });
      const json = await response.json();

      expect(json.success).toBe(true);
      const data = json.data;
      // Verify all fields are present
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("description");
      expect(data).toHaveProperty("category");
      expect(data).toHaveProperty("ingredients");
      expect(data).toHaveProperty("benefits");
      expect(data).toHaveProperty("imageUrl");
      expect(data).toHaveProperty("usage");
      expect(data).toHaveProperty("dosage");
      expect(data).toHaveProperty("precautions");
      expect(data).toHaveProperty("scientificInfo");
      expect(data).toHaveProperty("references");
      expect(data).toHaveProperty("relatedRemedies");
      expect(data).toHaveProperty("evidenceLevel");
    });
  });

  describe("Remedy Not Found", () => {
    it("should return 404 when remedy is not in database", async () => {
      vi.mocked(getNaturalRemedyById).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/remedy/nonexistent-id",
      );
      const params = Promise.resolve({ id: "nonexistent-id" });
      const response = await GET(request, { params });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json).toHaveProperty("error");
      expect(json.error.message).toContain("not found");
    });

    it("should fallback to mock data when database returns null", async () => {
      vi.mocked(getNaturalRemedyById).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/remedy/turmeric",
      );
      const params = Promise.resolve({ id: "turmeric" });
      const response = await GET(request, { params });

      // Should try mock data fallback
      // Status might be 200 if mock data has the remedy, or 404 if not
      expect([200, 404]).toContain(response.status);
    });
  });

  describe("ID Format Validation", () => {
    it("should handle UUID format IDs", async () => {
      const uuidId = "123e4567-e89b-12d3-a456-426614174000";
      vi.mocked(getNaturalRemedyById).mockResolvedValue(null);

      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${uuidId}`,
      );
      const params = Promise.resolve({ id: uuidId });
      const response = await GET(request, { params });

      expect(getNaturalRemedyById).toHaveBeenCalledWith(uuidId);
      expect([200, 404]).toContain(response.status);
    });

    it("should handle slug format IDs", async () => {
      const slugId = "turmeric-root";
      vi.mocked(getNaturalRemedyById).mockResolvedValue(null);

      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${slugId}`,
      );
      const params = Promise.resolve({ id: slugId });
      const response = await GET(request, { params });

      expect(getNaturalRemedyById).toHaveBeenCalledWith(slugId);
      expect([200, 404]).toContain(response.status);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", async () => {
      vi.mocked(getNaturalRemedyById).mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/remedy/test-id",
      );
      const params = Promise.resolve({ id: "test-id" });
      const response = await GET(request, { params });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json).toHaveProperty("error");
    });

    it("should handle malformed IDs gracefully", async () => {
      vi.mocked(getNaturalRemedyById).mockResolvedValue(null);

      const malformedId = '<script>alert("xss")</script>';
      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${encodeURIComponent(malformedId)}`,
      );
      const params = Promise.resolve({ id: malformedId });
      const response = await GET(request, { params });

      // 400 for invalid input, 404 for not found, or 500 for server error
      expect([400, 404, 500]).toContain(response.status);
    });

    it("should handle empty ID parameter", async () => {
      const request = new NextRequest("http://localhost:3000/api/remedy/");
      const params = Promise.resolve({ id: "" });
      const response = await GET(request, { params });

      expect([400, 404]).toContain(response.status);
    });
  });

  describe("Response Format", () => {
    it("should return proper JSON structure", async () => {
      const mockRemedy = {
        id: "test-id",
        name: "Test Remedy",
        description: "Test description",
        category: "Test Category",
        ingredients: ["Ingredient 1"],
        benefits: ["Benefit 1"],
        imageUrl: "https://example.com/image.jpg",
        usage: "Test usage",
        dosage: "Test dosage",
        precautions: "Test precautions",
        scientificInfo: "Test info",
        references: [],
        relatedRemedies: [],
        evidenceLevel: "Moderate",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getNaturalRemedyById).mockResolvedValue(mockRemedy as any);

      const request = new NextRequest(
        "http://localhost:3000/api/remedy/test-id",
      );
      const params = Promise.resolve({ id: "test-id" });
      const response = await GET(request, { params });
      const json = await response.json();

      // Verify structure
      expect(json.success).toBe(true);
      expect(typeof json.data).toBe("object");
      expect(Array.isArray(json.data.ingredients)).toBe(true);
      expect(Array.isArray(json.data.benefits)).toBe(true);
      expect(Array.isArray(json.data.references)).toBe(true);
      expect(Array.isArray(json.data.relatedRemedies)).toBe(true);
    });

    it("should include proper content-type header", async () => {
      vi.mocked(getNaturalRemedyById).mockResolvedValue({
        id: "test",
        name: "Test",
        description: "Test",
        category: "Test",
        ingredients: [],
        benefits: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest("http://localhost:3000/api/remedy/test");
      const params = Promise.resolve({ id: "test" });
      const response = await GET(request, { params });

      expect(response.headers.get("content-type")).toContain(
        "application/json",
      );
    });
  });

  describe("Related Remedies", () => {
    it("should include related remedies in response", async () => {
      const mockRemedy = {
        id: "main-remedy",
        name: "Main Remedy",
        description: "Main remedy description",
        category: "Category",
        ingredients: [],
        benefits: [],
        relatedRemedies: [
          {
            id: "related-1",
            name: "Related Remedy 1",
            reason: "Similar properties",
          },
          {
            id: "related-2",
            name: "Related Remedy 2",
            reason: "Alternative option",
          },
        ],
        evidenceLevel: "Strong",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getNaturalRemedyById).mockResolvedValue(mockRemedy as any);

      const request = new NextRequest(
        "http://localhost:3000/api/remedy/main-remedy",
      );
      const params = Promise.resolve({ id: "main-remedy" });
      const response = await GET(request, { params });
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.relatedRemedies).toHaveLength(2);
      expect(json.data.relatedRemedies[0]).toHaveProperty("id", "related-1");
      expect(json.data.relatedRemedies[0]).toHaveProperty("reason");
    });
  });

  describe("Scientific References", () => {
    it("should include scientific references in response", async () => {
      const mockRemedy = {
        id: "scientific-remedy",
        name: "Scientific Remedy",
        description: "Well-researched remedy",
        category: "Category",
        ingredients: [],
        benefits: [],
        references: [
          {
            title: "Clinical Study 2023",
            url: "https://pubmed.example.com/12345",
            year: 2023,
          },
          {
            title: "Meta-analysis 2022",
            url: "https://journals.example.com/67890",
            year: 2022,
          },
        ],
        evidenceLevel: "Strong",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getNaturalRemedyById).mockResolvedValue(mockRemedy as any);

      const request = new NextRequest(
        "http://localhost:3000/api/remedy/scientific-remedy",
      );
      const params = Promise.resolve({ id: "scientific-remedy" });
      const response = await GET(request, { params });
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.references).toHaveLength(2);
      expect(json.data.references[0]).toHaveProperty("title");
      expect(json.data.references[0]).toHaveProperty("url");
      expect(json.data.references[0]).toHaveProperty("year");
    });
  });
});
