/**
 * Tests for /api/remedy/[id] route
 *
 * Tests fetching detailed remedy information by ID.
 *
 * Note: database remedy IDs are Postgres `uuid` values, so the route only
 * queries the DB for UUID-shaped IDs. Non-UUID IDs (mock IDs, slugs) skip the
 * DB and fall through to mock data — exercised explicitly below.
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

type RemedyLookupResult = Awaited<ReturnType<typeof getNaturalRemedyById>>;

// Valid UUID-shaped IDs for tests that exercise the database path.
const REMEDY_ID = "11111111-1111-4111-8111-111111111111";
const FULL_REMEDY_ID = "22222222-2222-4222-8222-222222222222";
const ERROR_REMEDY_ID = "33333333-3333-4333-8333-333333333333";
const STRUCTURE_REMEDY_ID = "44444444-4444-4444-8444-444444444444";
const CONTENT_TYPE_REMEDY_ID = "55555555-5555-4555-8555-555555555555";
const RELATED_REMEDY_ID = "66666666-6666-4666-8666-666666666666";
const SCIENTIFIC_REMEDY_ID = "77777777-7777-4777-8777-777777777777";

describe("GET /api/remedy/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Valid Remedy ID", () => {
    it("should return remedy details from database when found", async () => {
      const mockRemedy = {
        id: REMEDY_ID,
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

      vi.mocked(getNaturalRemedyById).mockResolvedValue(
        mockRemedy as unknown as RemedyLookupResult,
      );

      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${REMEDY_ID}`,
      );
      const params = Promise.resolve({ id: REMEDY_ID });
      const response = await GET(request, { params });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveProperty("id", REMEDY_ID);
      expect(json.data).toHaveProperty("name", "Turmeric");
      expect(json.data).toHaveProperty("description");
      expect(json.data).toHaveProperty("benefits");
      expect(Array.isArray(json.data.benefits)).toBe(true);
      expect(json.data).toHaveProperty("evidenceLevel", "Strong");
      expect(getNaturalRemedyById).toHaveBeenCalledWith(REMEDY_ID);
    });

    it("should return remedy with all expected fields", async () => {
      const mockRemedy = {
        id: FULL_REMEDY_ID,
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

      vi.mocked(getNaturalRemedyById).mockResolvedValue(
        mockRemedy as unknown as RemedyLookupResult,
      );

      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${FULL_REMEDY_ID}`,
      );
      const params = Promise.resolve({ id: FULL_REMEDY_ID });
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
    it("should query the database for UUID-shaped IDs", async () => {
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

    it("should NOT query the database for non-UUID (slug) IDs", async () => {
      // DB IDs are Postgres uuids; a slug would throw an invalid-input error,
      // so the route must skip the DB and use mock data instead.
      const slugId = "turmeric-root";
      vi.mocked(getNaturalRemedyById).mockResolvedValue(null);

      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${slugId}`,
      );
      const params = Promise.resolve({ id: slugId });
      const response = await GET(request, { params });

      expect(getNaturalRemedyById).not.toHaveBeenCalled();
      // Slug is not in mock data, so it resolves to 404 rather than a 500.
      expect(response.status).toBe(404);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", async () => {
      vi.mocked(getNaturalRemedyById).mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${ERROR_REMEDY_ID}`,
      );
      const params = Promise.resolve({ id: ERROR_REMEDY_ID });
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
        id: STRUCTURE_REMEDY_ID,
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

      vi.mocked(getNaturalRemedyById).mockResolvedValue(
        mockRemedy as unknown as RemedyLookupResult,
      );

      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${STRUCTURE_REMEDY_ID}`,
      );
      const params = Promise.resolve({ id: STRUCTURE_REMEDY_ID });
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
        id: CONTENT_TYPE_REMEDY_ID,
        name: "Test",
        description: "Test",
        category: "Test",
        ingredients: [],
        benefits: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as RemedyLookupResult);

      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${CONTENT_TYPE_REMEDY_ID}`,
      );
      const params = Promise.resolve({ id: CONTENT_TYPE_REMEDY_ID });
      const response = await GET(request, { params });

      expect(response.headers.get("content-type")).toContain(
        "application/json",
      );
    });
  });

  describe("Related Remedies", () => {
    it("should include related remedies in response", async () => {
      const mockRemedy = {
        id: RELATED_REMEDY_ID,
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

      vi.mocked(getNaturalRemedyById).mockResolvedValue(
        mockRemedy as unknown as RemedyLookupResult,
      );

      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${RELATED_REMEDY_ID}`,
      );
      const params = Promise.resolve({ id: RELATED_REMEDY_ID });
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
        id: SCIENTIFIC_REMEDY_ID,
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

      vi.mocked(getNaturalRemedyById).mockResolvedValue(
        mockRemedy as unknown as RemedyLookupResult,
      );

      const request = new NextRequest(
        `http://localhost:3000/api/remedy/${SCIENTIFIC_REMEDY_ID}`,
      );
      const params = Promise.resolve({ id: SCIENTIFIC_REMEDY_ID });
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
