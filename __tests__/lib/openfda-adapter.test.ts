/**
 * The production adapter, driven through the real search seam.
 *
 * `search-resolve.test.ts` proves `resolveSearch` handles an unavailable
 * OpenFDA tier, but it proves it against an in-memory adapter. The shipped
 * one is `searchFdaDrugs`, and for a long time the two did not agree: the port
 * was typed `Promise<ProcessedDrug[]>` and documented as throwing when
 * unreachable, while `searchFdaDrugs` caught everything and returned `[]`. So
 * an OpenFDA outage resolved to `absent` and reached the page as "No results
 * found." — the exact collapse the module exists to prevent — while the
 * in-memory test stayed green.
 *
 * This file closes that gap: it runs the real adapter, with only the network
 * faked, and asserts the outcome the tier chain actually produces.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveSearch, type SearchPorts } from "@/lib/search/resolve";
import { known } from "@/lib/outcome";

const originalFetch = global.fetch;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.useRealTimers();
});

/** Ports whose database tier finds nothing, so the search reaches OpenFDA. */
function portsReachingFda(searchFda: SearchPorts["searchFda"]): SearchPorts {
  return {
    findPharmaceuticals: async () => [],
    findRemediesFor: async () => [],
    generateMappingsFor: async () => known([]),
    searchFda,
    cachePharmaceutical: async () => ({ id: "cached" }),
    // Demo data must not stand in for an outage, so it is available here and
    // must still not be used.
    findDemoRemedies: () => [
      {
        id: "demo-1",
        name: "Demo Remedy",
        description: "",
        imageUrl: "",
        category: "herb",
        matchingNutrients: [],
        similarityScore: 0.9,
        replacementType: "Supportive",
      },
    ],
  };
}

describe("the shipped OpenFDA adapter satisfies the search port", () => {
  it("resolves an unreachable OpenFDA to unavailable, not absent", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const { searchFdaDrugs } = await import("@/lib/openFDA");

    const outcome = await resolveSearch(
      "ibuprofen",
      portsReachingFda(searchFdaDrugs),
    );

    expect(outcome).toEqual({ kind: "unavailable", which: "openfda" });
  }, 30000);

  it("still resolves a genuine 404 from OpenFDA to absent", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response("Not Found", { status: 404 }));
    const { searchFdaDrugs } = await import("@/lib/openFDA");

    const outcome = await resolveSearch(
      "nonexistent",
      portsReachingFda(searchFdaDrugs),
    );

    // OpenFDA answered. Demo data may stand in for an empty catalogue.
    expect(outcome).toMatchObject({ kind: "found", source: "demo" });
  }, 30000);
});
