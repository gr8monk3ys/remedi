/**
 * Tests for search resolution.
 *
 * The property under test: an outage is never reported as an empty result.
 * The route used to return 200 with an empty list when the database was
 * down, which a user reads as "there are no natural remedies for this drug".
 *
 * Every case here runs with no database and no network — the ports are an
 * in-memory object.
 */

import { describe, it, expect, vi } from "vitest";
import { resolveSearch, type SearchPorts } from "@/lib/search/resolve";
import type { NaturalRemedy, ProcessedDrug } from "@/lib/types";

const DRUG: ProcessedDrug = {
  id: "p1",
  fdaId: "fda-1",
  name: "Ibuprofen",
  description: "",
  category: "NSAID",
  ingredients: ["ibuprofen"],
  benefits: ["pain relief"],
};

const REMEDY: NaturalRemedy = {
  id: "r1",
  name: "Turmeric",
  description: "",
  imageUrl: "",
  category: "herb",
  matchingNutrients: ["curcumin"],
  similarityScore: 0.8,
  replacementType: "Complementary",
};

function ports(overrides: Partial<SearchPorts> = {}): SearchPorts {
  return {
    findPharmaceuticals: async () => [],
    findRemediesFor: async () => [],
    generateMappingsFor: async () => [],
    searchFda: async () => [],
    cachePharmaceutical: async () => ({ id: "p1" }),
    findDemoRemedies: () => null,
    ...overrides,
  };
}

describe("found", () => {
  it("returns stored mappings from the database", async () => {
    const outcome = await resolveSearch(
      "ibuprofen",
      ports({
        findPharmaceuticals: async () => [DRUG],
        findRemediesFor: async () => [REMEDY],
      }),
    );

    expect(outcome).toEqual({
      kind: "found",
      remedies: [REMEDY],
      source: "database",
    });
  });

  it("generates mappings when the drug is known but unmapped", async () => {
    const generate = vi.fn().mockResolvedValue([REMEDY]);

    const outcome = await resolveSearch(
      "ibuprofen",
      ports({
        findPharmaceuticals: async () => [DRUG],
        findRemediesFor: async () => [],
        generateMappingsFor: generate,
      }),
    );

    expect(generate).toHaveBeenCalledWith({
      pharmaceuticalId: "p1",
      drug: DRUG,
    });
    expect(outcome).toMatchObject({ kind: "found", source: "database" });
  });

  it("falls through to OpenFDA and caches the drug back", async () => {
    const cache = vi.fn().mockResolvedValue({ id: "cached-1" });

    const outcome = await resolveSearch(
      "novel drug",
      ports({
        searchFda: async () => [DRUG],
        cachePharmaceutical: cache,
        generateMappingsFor: async () => [REMEDY],
      }),
    );

    expect(cache).toHaveBeenCalledWith(DRUG);
    expect(outcome).toMatchObject({ kind: "found", source: "openfda" });
  });

  it("serves demo remedies when nothing else matched", async () => {
    const outcome = await resolveSearch(
      "anything",
      ports({ findDemoRemedies: () => [REMEDY] }),
    );

    expect(outcome).toEqual({
      kind: "found",
      remedies: [REMEDY],
      source: "demo",
    });
  });
});

describe("absent", () => {
  it("reports an honest empty result when every tier was reached", async () => {
    const outcome = await resolveSearch("nothing matches", ports());
    expect(outcome).toEqual({ kind: "absent" });
  });

  it("is absent, not unavailable, when OpenFDA simply has no match", async () => {
    const outcome = await resolveSearch(
      "unknown",
      ports({ searchFda: async () => [] }),
    );
    expect(outcome).toEqual({ kind: "absent" });
  });
});

describe("unavailable", () => {
  it("does not report a database outage as an empty result", async () => {
    const outcome = await resolveSearch(
      "ibuprofen",
      ports({
        findPharmaceuticals: async () => {
          throw new Error("connection refused");
        },
      }),
    );

    expect(outcome).toEqual({ kind: "unavailable", which: "database" });
  });

  it("treats a failure to load mappings as unavailable, not as none", async () => {
    const outcome = await resolveSearch(
      "ibuprofen",
      ports({
        findPharmaceuticals: async () => [DRUG],
        findRemediesFor: async () => {
          throw new Error("query failed");
        },
      }),
    );

    expect(outcome).toEqual({ kind: "unavailable", which: "database" });
  });

  it("reports an OpenFDA failure as unavailable", async () => {
    const outcome = await resolveSearch(
      "novel drug",
      ports({
        searchFda: async () => {
          throw new Error("network down");
        },
      }),
    );

    expect(outcome).toEqual({ kind: "unavailable", which: "openfda" });
  });

  it("does not let a failed cache-back silently discard the drug", async () => {
    const outcome = await resolveSearch(
      "novel drug",
      ports({
        searchFda: async () => [DRUG],
        cachePharmaceutical: async () => {
          throw new Error("write failed");
        },
      }),
    );

    expect(outcome).toEqual({ kind: "unavailable", which: "database" });
  });

  it("treats a cache-back that returns no id as a failure", async () => {
    const outcome = await resolveSearch(
      "novel drug",
      ports({
        searchFda: async () => [DRUG],
        cachePharmaceutical: async () => ({}) as { id: string },
      }),
    );

    expect(outcome).toEqual({ kind: "unavailable", which: "database" });
  });

  it("prefers demo data over reporting an outage, when demo is enabled", async () => {
    const outcome = await resolveSearch(
      "ibuprofen",
      ports({
        findPharmaceuticals: async () => {
          throw new Error("connection refused");
        },
        findDemoRemedies: () => [REMEDY],
      }),
    );

    expect(outcome).toMatchObject({ kind: "found", source: "demo" });
  });
});
