/**
 * Pharmaceutical search, as one decision.
 *
 * The search route used to express its tier chain — database, then OpenFDA,
 * then demo data — as control flow over awaits inside the handler. That made
 * two identical failures behave differently depending on where a `try`
 * happened to sit: a database outage returned 200 with an empty list, which a
 * user reads as "no remedies exist for this drug", while an OpenFDA failure
 * returned 500.
 *
 * This module makes the outcome explicit instead. `absent` means we searched
 * and found nothing; `unavailable` means we could not finish searching. The
 * caller has to tell them apart.
 */

import type { NaturalRemedy, ProcessedDrug } from "@/lib/types";
import type { MappingOutcome } from "@/lib/remedy-matcher";
import { dataOr } from "@/lib/outcome";

export type SearchSource = "database" | "openfda" | "demo";

export type SearchOutcome =
  | { kind: "found"; remedies: NaturalRemedy[]; source: SearchSource }
  /** Every tier was reached and none matched. An honest empty result. */
  | { kind: "absent" }
  /** A tier we depend on could not be reached. Never an empty result. */
  | { kind: "unavailable"; which: "database" | "openfda" };

/**
 * The systems search talks to.
 *
 * Two adapters satisfy this: the real one in the route, and an in-memory one
 * in tests — which is what lets the tier chain be tested with no database and
 * no network.
 */
export interface SearchPorts {
  findPharmaceuticals(query: string): Promise<ProcessedDrug[]>;
  findRemediesFor(pharmaceuticalId: string): Promise<NaturalRemedy[]>;
  generateMappingsFor(args: {
    pharmaceuticalId: string;
    drug: ProcessedDrug;
  }): Promise<MappingOutcome>;
  searchFda(query: string): Promise<ProcessedDrug[]>;
  cachePharmaceutical(drug: ProcessedDrug): Promise<{ id: string }>;
  /** Demo fallback; returns null when demo data is disabled. */
  findDemoRemedies(query: string): NaturalRemedy[] | null;
}

/**
 * The one place a policy refusal is flattened into an empty result list.
 *
 * A "never-mapped" refusal is a real answer — the policy withholds remedies
 * for anticoagulants on purpose — but the search response has no field to
 * carry it yet, so today it renders as an empty list exactly as it did before.
 *
 * This function exists so that collapse is a single, named, greppable step
 * rather than an `[]` returned from six places. When the search response grows
 * an outcome of its own, this is the only thing that has to change.
 */
function collapseMappingOutcome(outcome: MappingOutcome): NaturalRemedy[] {
  return dataOr(outcome, []);
}

class TierUnavailable extends Error {
  constructor(readonly which: "database" | "openfda") {
    super(`${which} unavailable`);
  }
}

/** Remedies for a pharmaceutical already in our database, if any. */
async function fromDatabase(
  query: string,
  ports: SearchPorts,
): Promise<NaturalRemedy[]> {
  let drugs: ProcessedDrug[];
  try {
    drugs = await ports.findPharmaceuticals(query);
  } catch {
    throw new TierUnavailable("database");
  }

  const drug = drugs[0];
  if (!drug) return [];

  try {
    const existing = await ports.findRemediesFor(drug.id);
    if (existing.length > 0) return existing;

    return collapseMappingOutcome(
      await ports.generateMappingsFor({
        pharmaceuticalId: drug.id,
        drug,
      }),
    );
  } catch {
    // The drug is known but its mappings could not be produced. That is a
    // failure to answer, not an answer of "none".
    throw new TierUnavailable("database");
  }
}

/** Remedies for a drug discovered at OpenFDA, cached back on the way through. */
async function fromOpenFda(
  query: string,
  ports: SearchPorts,
): Promise<NaturalRemedy[]> {
  let drugs: ProcessedDrug[];
  try {
    drugs = await ports.searchFda(query);
  } catch {
    throw new TierUnavailable("openfda");
  }

  const drug = drugs[0];
  if (!drug) return [];

  // The cache-back is load-bearing, not an optimisation: mappings are keyed on
  // the persisted row, so a failed write means we cannot answer at all.
  try {
    const saved = await ports.cachePharmaceutical(drug);
    if (!saved?.id) throw new Error("cachePharmaceutical returned no id");
    return collapseMappingOutcome(
      await ports.generateMappingsFor({
        pharmaceuticalId: saved.id,
        drug,
      }),
    );
  } catch {
    throw new TierUnavailable("database");
  }
}

/**
 * Resolve a search query to remedies, or to an explicit reason we could not.
 */
export async function resolveSearch(
  query: string,
  ports: SearchPorts,
): Promise<SearchOutcome> {
  try {
    const fromDb = await fromDatabase(query, ports);
    if (fromDb.length > 0) {
      return { kind: "found", remedies: fromDb, source: "database" };
    }

    const fromFda = await fromOpenFda(query, ports);
    if (fromFda.length > 0) {
      return { kind: "found", remedies: fromFda, source: "openfda" };
    }
  } catch (error) {
    if (error instanceof TierUnavailable) {
      // Deliberately no demo fallback here. A tier that threw is an outage,
      // and answering an outage with demo data reports a failure as a result —
      // the same collapse this module exists to prevent, dressed as a
      // convenience. Demo data stands in for an empty catalogue, never for a
      // database that is down.
      return { kind: "unavailable", which: error.which };
    }
    throw error;
  }

  // Both tiers answered, and neither had anything. Demo data is a reasonable
  // stand-in for that in development, because "we looked and found none" is
  // what actually happened.
  const demo = ports.findDemoRemedies(query);
  if (demo && demo.length > 0) {
    return { kind: "found", remedies: demo, source: "demo" };
  }

  return { kind: "absent" };
}
