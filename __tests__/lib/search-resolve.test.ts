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
import { known, unknown } from "@/lib/outcome";
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
    generateMappingsFor: async () => known([]),
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
    const generate = vi.fn().mockResolvedValue(known([REMEDY]));

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
        generateMappingsFor: async () => known([REMEDY]),
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

describe("colliding pharmaceutical records", () => {
  // OpenFDA caches a record under whatever name the label leads with, so
  // "Ibuprofen Dye Free" ends up beside the curated "Ibuprofen" and can
  // outrank it. Production answered "no results for ibuprofen" while seven
  // curated mappings sat on the other record.
  const cached: ProcessedDrug = {
    ...DRUG,
    id: "p-cached",
    name: "Ibuprofen Dye Free",
  };
  const curated: ProcessedDrug = {
    ...DRUG,
    id: "p-curated",
    name: "Ibuprofen",
  };

  it("answers from the candidate that has mappings, not the first one", async () => {
    const outcome = await resolveSearch(
      "ibuprofen",
      ports({
        findPharmaceuticals: async () => [cached, curated],
        findRemediesFor: async (id: string) =>
          id === "p-curated" ? [REMEDY] : [],
      }),
    );

    expect(outcome).toEqual({
      kind: "found",
      remedies: [REMEDY],
      source: "database",
    });
  });

  it("still generates when no candidate carries mappings", async () => {
    const generateMappingsFor = vi.fn(async () => known([REMEDY]));
    const outcome = await resolveSearch(
      "ibuprofen",
      ports({
        findPharmaceuticals: async () => [cached, curated],
        findRemediesFor: async () => [],
        generateMappingsFor,
      }),
    );

    expect(outcome.kind).toBe("found");
    // Generation is for the top-ranked match, and happens once.
    expect(generateMappingsFor).toHaveBeenCalledTimes(1);
    expect(generateMappingsFor).toHaveBeenCalledWith(
      expect.objectContaining({ pharmaceuticalId: "p-cached" }),
    );
  });
});

describe("refused", () => {
  // The policy withholds remedies for anticoagulants and SSRIs on purpose.
  // Until now that arrived as an empty list, indistinguishable from "we
  // looked and found none" — the one confusion the whole policy exists to
  // prevent, surviving all the way to the primary search path.
  const refusal = unknown<never, "never-mapped">(
    "never-mapped",
    "Warfarin is an anticoagulant; even a supportive addition alters bleeding risk.",
  );

  it("states the refusal instead of returning an empty list", async () => {
    const outcome = await resolveSearch(
      "warfarin",
      ports({
        findPharmaceuticals: async () => [DRUG],
        generateMappingsFor: async () => refusal,
      }),
    );

    expect(outcome).toEqual({
      kind: "refused",
      reason: "never-mapped",
      message:
        "Warfarin is an anticoagulant; even a supportive addition alters bleeding risk.",
    });
  });

  it("does not fall through to OpenFDA", async () => {
    const searchFda = vi.fn(async () => [DRUG]);
    const outcome = await resolveSearch(
      "warfarin",
      ports({
        findPharmaceuticals: async () => [DRUG],
        generateMappingsFor: async () => refusal,
        searchFda,
      }),
    );

    // Answering "we will not map this drug" with a list from another tier
    // would undo the refusal entirely.
    expect(outcome.kind).toBe("refused");
    expect(searchFda).not.toHaveBeenCalled();
  });

  it("does not fall through to demo data", async () => {
    const findDemoRemedies = vi.fn(() => [REMEDY]);
    const outcome = await resolveSearch(
      "warfarin",
      ports({
        findPharmaceuticals: async () => [DRUG],
        generateMappingsFor: async () => refusal,
        findDemoRemedies,
      }),
    );

    expect(outcome.kind).toBe("refused");
    expect(findDemoRemedies).not.toHaveBeenCalled();
  });

  it("is distinguishable from an honest empty result", async () => {
    const absent = await resolveSearch(
      "aspirin",
      ports({
        findPharmaceuticals: async () => [DRUG],
        generateMappingsFor: async () => known([]),
      }),
    );

    expect(absent).toEqual({ kind: "absent" });
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

  it("reports the outage rather than answering it with demo data", async () => {
    // This previously preferred demo data, which reported a database outage as
    // a successful result. Demo data stands in for an empty catalogue; it must
    // never stand in for a tier that failed, because the caller cannot tell
    // the difference and neither can the person reading the page.
    const outcome = await resolveSearch(
      "ibuprofen",
      ports({
        findPharmaceuticals: async () => {
          throw new Error("connection refused");
        },
        findDemoRemedies: () => [REMEDY],
      }),
    );

    expect(outcome).toEqual({ kind: "unavailable", which: "database" });
  });

  it("still uses demo data when both tiers answered and found nothing", async () => {
    const outcome = await resolveSearch(
      "nothing here",
      ports({ findDemoRemedies: () => [REMEDY] }),
    );

    expect(outcome).toMatchObject({ kind: "found", source: "demo" });
  });
});
