/**
 * Re-run the Remedy Mapping safety policy over everything already persisted.
 *
 * Closing a gate stops new violations; it does nothing about the rows written
 * while the gate was open. This finds those rows.
 *
 * Four checks, all sourced from the same policy the write paths now use, so
 * this script cannot drift from them:
 *
 *   refused   the drug may carry no mapping at all (anticoagulants)
 *   forbidden the pair is a recorded Drug Interaction (magnesium x cipro)
 *   overclaim the Replacement Type asserts more than the policy allows
 *   belowfloor the Similarity Score is under the display floor
 *
 * Dry run by default. `--apply` is required to change anything, because
 * deleting rows from a production database on a first invocation is not a
 * thing a script should be able to do by accident.
 *
 *   bun run scripts/remediate-mappings.ts            # report only
 *   bun run scripts/remediate-mappings.ts --apply    # delete and demote
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  MIN_DISPLAY_SIMILARITY,
  certifyReplacementType,
  interactionTerms,
  isRemedyForbidden,
  parseReplacementType,
  type PolicyIdentity,
} from "../lib/remedy-matcher.ts";

const APPLY = process.argv.includes("--apply");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to remediate mappings.");
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type Violation = {
  kind: "refused" | "forbidden" | "overclaim" | "below-floor";
  mappingId: string;
  drug: string;
  remedy: string;
  detail: string;
  /** Set for an overclaim: what the Replacement Type should be instead. */
  demoteTo?: "Alternative" | "Complementary" | "Supportive";
};

async function main() {
  const interactions = await prisma.drugInteraction.findMany({
    where: { severity: { in: ["moderate", "severe", "contraindicated"] } },
    select: { substanceA: true, substanceB: true },
  });

  const mappings = await prisma.naturalRemedyMapping.findMany({
    include: {
      pharmaceutical: {
        select: {
          name: true,
          genericName: true,
          category: true,
          ingredients: true,
        },
      },
      naturalRemedy: { select: { name: true } },
    },
  });

  const violations: Violation[] = [];

  for (const mapping of mappings) {
    const drug: PolicyIdentity = {
      name: mapping.pharmaceutical.name,
      genericName: mapping.pharmaceutical.genericName ?? undefined,
      category: mapping.pharmaceutical.category,
      ingredients: mapping.pharmaceutical.ingredients,
    };
    const remedy = mapping.naturalRemedy.name;
    const base = { mappingId: mapping.id, drug: drug.name, remedy };

    const certified = certifyReplacementType(drug, mapping.replacementType);

    if (certified.kind === "unknown") {
      violations.push({
        ...base,
        kind: "refused",
        detail: certified.message,
      });
      continue;
    }

    const haystack = [
      drug.name,
      drug.genericName,
      drug.category,
      ...(drug.ingredients ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const forbiddenTerms = new Set<string>();
    for (const row of interactions) {
      if (
        interactionTerms(row.substanceB).some((term) => haystack.includes(term))
      ) {
        for (const term of interactionTerms(row.substanceA)) {
          forbiddenTerms.add(term);
        }
      }
    }

    if (isRemedyForbidden(remedy, [...forbiddenTerms])) {
      violations.push({
        ...base,
        kind: "forbidden",
        detail: "a recorded Drug Interaction covers this pair",
      });
      continue;
    }

    if (mapping.similarityScore < MIN_DISPLAY_SIMILARITY) {
      violations.push({
        ...base,
        kind: "below-floor",
        detail: `score ${mapping.similarityScore} is under ${MIN_DISPLAY_SIMILARITY}`,
      });
      continue;
    }

    const stored = parseReplacementType(mapping.replacementType);
    if (stored !== certified.data) {
      violations.push({
        ...base,
        kind: "overclaim",
        detail: `${mapping.replacementType} should be ${certified.data}`,
        demoteTo: certified.data,
      });
    }
  }

  const byKind = violations.reduce<Record<string, number>>((acc, v) => {
    acc[v.kind] = (acc[v.kind] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Mappings inspected : ${mappings.length}`);
  console.log(`Violations found   : ${violations.length}`);
  for (const [kind, count] of Object.entries(byKind)) {
    console.log(`  ${kind.padEnd(12)} ${count}`);
  }

  for (const v of violations) {
    console.log(`  [${v.kind}] ${v.drug} -> ${v.remedy} (${v.detail})`);
  }

  if (violations.length === 0) {
    console.log("\nNothing to remediate.");
    return;
  }

  if (!APPLY) {
    console.log(
      "\nDry run. Nothing was changed. Re-run with --apply to delete refused," +
        " forbidden and below-floor mappings and demote overclaims.",
    );
    return;
  }

  // Deleting is right for a pair that must not exist; demoting is right for a
  // pair that may exist but was claiming too much.
  const toDelete = violations
    .filter((v) => v.kind !== "overclaim")
    .map((v) => v.mappingId);

  if (toDelete.length > 0) {
    const { count } = await prisma.naturalRemedyMapping.deleteMany({
      where: { id: { in: toDelete } },
    });
    console.log(`\nDeleted ${count} mappings.`);
  }

  let demoted = 0;
  for (const v of violations) {
    if (v.kind !== "overclaim" || !v.demoteTo) continue;
    await prisma.naturalRemedyMapping.update({
      where: { id: v.mappingId },
      data: { replacementType: v.demoteTo },
    });
    demoted++;
  }
  if (demoted > 0) {
    console.log(`Demoted ${demoted} Replacement Types.`);
  }
}

try {
  await main();
} finally {
  await prisma.$disconnect();
  await pool.end();
}
