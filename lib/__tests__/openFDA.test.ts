/**
 * Unit Tests for OpenFDA API Integration
 *
 * Tests the FDA API integration including:
 * - Drug search functionality
 * - Drug lookup by ID
 * - Retry logic
 * - Error handling
 * - Response processing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";
import { mockFdaApiResponse } from "../../__tests__/mocks";

// Store original fetch
const originalFetch = global.fetch;

// Mock fetch globally
let mockFetch: MockedFunction<typeof fetch>;

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const errorResponse = (status: number, statusText: string): Response =>
  new Response(statusText, { status, statusText });

beforeEach(() => {
  mockFetch = vi.fn() as MockedFunction<typeof fetch>;
  global.fetch = mockFetch;
  vi.stubEnv("OPENFDA_API_KEY", "");
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.unstubAllEnvs();
  vi.resetModules();
});

// Import after mocking
async function getModule() {
  vi.resetModules();
  return import("../openFDA");
}

describe("OpenFDA API Integration", () => {
  describe("searchFdaDrugs", () => {
    it("should search for drugs and return processed results", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockFdaApiResponse));

      const { searchFdaDrugs } = await getModule();
      const results = await searchFdaDrugs("ibuprofen");

      expect(mockFetch).toHaveBeenCalled();
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("api.fda.gov");
      expect(calledUrl).toContain("ibuprofen");
      expect(calledUrl).toContain("limit=5");

      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty("name");
      expect(results[0]).toHaveProperty("fdaId");
      expect(results[0]).toHaveProperty("category");
      expect(results[0]).toHaveProperty("ingredients");
    });

    it("should include API key when configured", async () => {
      vi.stubEnv("OPENFDA_API_KEY", "test-api-key");

      mockFetch.mockResolvedValueOnce(jsonResponse(mockFdaApiResponse));

      const { searchFdaDrugs } = await getModule();
      await searchFdaDrugs("aspirin");

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("api_key=test-api-key");
    });

    it("should return empty array when no results found (404)", async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));

      const { searchFdaDrugs } = await getModule();
      const results = await searchFdaDrugs("nonexistent-drug");

      expect(results).toEqual([]);
    });

    it("should return empty array on API error", async () => {
      mockFetch.mockResolvedValueOnce(
        errorResponse(500, "Internal Server Error"),
      );

      const { searchFdaDrugs } = await getModule();
      const results = await searchFdaDrugs("test");

      // Should return empty array instead of throwing
      expect(results).toEqual([]);
    });

    it("should handle rate limiting (429) with retry", async () => {
      // First call returns 429, second returns success
      mockFetch
        .mockResolvedValueOnce(errorResponse(429, "Too Many Requests"))
        .mockResolvedValueOnce(jsonResponse(mockFdaApiResponse));

      const { searchFdaDrugs } = await getModule();

      // Use fake timers to avoid waiting
      vi.useFakeTimers();
      const resultPromise = searchFdaDrugs("ibuprofen");
      await vi.advanceTimersByTimeAsync(65000); // Wait for rate limit delay
      const results = await resultPromise;
      vi.useRealTimers();

      // Should have been called twice due to retry
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(1);
    });

    it("should respect custom limit parameter", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockFdaApiResponse));

      const { searchFdaDrugs } = await getModule();
      await searchFdaDrugs("ibuprofen", 10);

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("limit=10");
    });

    it("should URL-encode the search query", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ results: [] }));

      const { searchFdaDrugs } = await getModule();
      await searchFdaDrugs("pain + relief");

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("pain%20%2B%20relief");
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { searchFdaDrugs } = await getModule();

      // Use fake timers for retry delays
      vi.useFakeTimers();
      const resultPromise = searchFdaDrugs("test");
      await vi.advanceTimersByTimeAsync(10000);
      const results = await resultPromise;
      vi.useRealTimers();

      expect(results).toEqual([]);
    });

    it("should process FDA results correctly", async () => {
      const detailedResponse = {
        results: [
          {
            id: "fda-123",
            openfda: {
              brand_name: ["Advil"],
              generic_name: ["Ibuprofen"],
              product_type: ["HUMAN OTC DRUG"],
              route: ["ORAL"],
              substance_name: ["IBUPROFEN"],
            },
            active_ingredient: ["IBUPROFEN 200 MG"],
            indications_and_usage: ["For temporary relief of minor aches"],
            purpose: ["Pain reliever"],
            dosage_and_administration: ["Take 1-2 tablets"],
            warnings: ["Do not exceed dose"],
            drug_interactions: ["Avoid with aspirin"],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce(jsonResponse(detailedResponse));

      const { searchFdaDrugs } = await getModule();
      const results = await searchFdaDrugs("advil");

      expect(results[0].name).toBe("Advil");
      expect(results[0].fdaId).toBe("fda-123");
      // Category comes from product_type if available, or route otherwise
      expect(results[0].category).toBeDefined();
      expect(results[0].ingredients).toEqual(["IBUPROFEN 200 MG"]);
      expect(results[0].usage).toBe("Take 1-2 tablets");
      expect(results[0].warnings).toBe("Do not exceed dose");
      expect(results[0].interactions).toBe("Avoid with aspirin");
    });
  });

  describe("getFdaDrugById", () => {
    it("should fetch drug by FDA ID", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockFdaApiResponse));

      const { getFdaDrugById } = await getModule();
      const result = await getFdaDrugById("fda-123");

      expect(mockFetch).toHaveBeenCalled();
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("id:fda-123");

      expect(result).not.toBeNull();
      expect(result).toHaveProperty("fdaId");
    });

    it("should return null when drug not found", async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));

      const { getFdaDrugById } = await getModule();
      const result = await getFdaDrugById("nonexistent-id");

      expect(result).toBeNull();
    });

    it("should return null when API returns empty results", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ results: [] }));

      const { getFdaDrugById } = await getModule();
      const result = await getFdaDrugById("empty-results-id");

      expect(result).toBeNull();
    });

    it("should handle API errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce(
        errorResponse(500, "Internal Server Error"),
      );

      const { getFdaDrugById } = await getModule();
      const result = await getFdaDrugById("test-id");

      expect(result).toBeNull();
    });
  });

  describe("Response Processing", () => {
    it("should use generic name when brand name is missing", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          results: [
            {
              id: "test-id",
              openfda: {
                generic_name: ["ACETAMINOPHEN"],
              },
              indications_and_usage: ["For pain relief"],
            },
          ],
        }),
      );

      const { searchFdaDrugs } = await getModule();
      const results = await searchFdaDrugs("acetaminophen");

      expect(results[0].name).toBe("ACETAMINOPHEN");
    });

    it('should default to "Unknown Drug" when no name available', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          results: [
            {
              id: "test-id",
              openfda: {},
              indications_and_usage: ["For general use"],
            },
          ],
        }),
      );

      const { searchFdaDrugs } = await getModule();
      const results = await searchFdaDrugs("unknown");

      expect(results[0].name).toBe("Unknown Drug");
    });

    it("should determine category from route of administration", async () => {
      const testCases = [
        { route: "ORAL", expected: "Oral Medication" },
        { route: "TOPICAL", expected: "Topical Treatment" },
        { route: "OPHTHALMIC", expected: "Eye Treatment" },
        { route: "NASAL", expected: "Nasal Treatment" },
      ];

      for (const testCase of testCases) {
        vi.resetModules();
        mockFetch.mockResolvedValueOnce(
          jsonResponse({
            results: [
              {
                id: "test-id",
                openfda: {
                  brand_name: ["Test Drug"],
                  route: [testCase.route],
                },
              },
            ],
          }),
        );

        const { searchFdaDrugs } = await getModule();
        const results = await searchFdaDrugs("test");

        expect(results[0].category).toBe(testCase.expected);
      }
    });

    it("should determine category from indications when route is missing", async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          results: [
            {
              id: "test-id",
              openfda: {
                brand_name: ["Sleep Aid"],
              },
              indications_and_usage: [
                "For relief of insomnia and sleep problems",
              ],
            },
          ],
        }),
      );

      const { searchFdaDrugs } = await getModule();
      const results = await searchFdaDrugs("sleep");

      expect(results[0].category).toBe("Sleep Aid");
    });

    it("should truncate long descriptions", async () => {
      const longText = "A".repeat(300);
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          results: [
            {
              id: "test-id",
              openfda: { brand_name: ["Test"] },
              indications_and_usage: [longText],
            },
          ],
        }),
      );

      const { searchFdaDrugs } = await getModule();
      const results = await searchFdaDrugs("test");

      expect(results[0].description.length).toBeLessThanOrEqual(203); // 200 + '...'
      expect(results[0].description.endsWith("...")).toBe(true);
    });
  });

  describe("Retry Logic", () => {
    it("should retry on 5xx server errors", async () => {
      mockFetch
        .mockResolvedValueOnce(errorResponse(503, "Service Unavailable"))
        .mockResolvedValueOnce(jsonResponse(mockFdaApiResponse));

      const { searchFdaDrugs } = await getModule();

      vi.useFakeTimers();
      const resultPromise = searchFdaDrugs("test");
      await vi.advanceTimersByTimeAsync(5000);
      const results = await resultPromise;
      vi.useRealTimers();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(1);
    });

    it("should eventually fail after max retries", async () => {
      mockFetch.mockRejectedValue(new Error("Persistent network error"));

      const { searchFdaDrugs } = await getModule();

      vi.useFakeTimers();
      const resultPromise = searchFdaDrugs("test");
      await vi.advanceTimersByTimeAsync(20000);
      const results = await resultPromise;
      vi.useRealTimers();

      expect(results).toEqual([]);
    });
  });
});
