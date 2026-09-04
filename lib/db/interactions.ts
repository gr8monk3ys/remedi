/**
 * Drug Interaction Database Operations
 *
 * Provides database query functions for looking up drug-supplement interactions.
 *
 * IMPORTANT: This module is server-only and cannot be imported in client components.
 */

import "server-only";
import { prisma } from "./client";
import {
  FORBIDDING_SEVERITIES,
  forbiddenRemedyGroupsFor,
  type PolicyIdentity,
} from "@/lib/remedy-matcher";

/** Severity ranking for sorting (most severe first) */
const SEVERITY_ORDER: Record<string, number> = {
  contraindicated: 0,
  severe: 1,
  moderate: 2,
  mild: 3,
};

/**
 * Find all interactions involving a given substance.
 * Searches both substanceA and substanceB fields using case-insensitive matching.
 *
 * @param substanceName - Name of the substance to search for
 * @returns Interactions sorted by severity (most severe first)
 */
export async function findInteractionsBySubstance(
  substanceName: string,
): Promise<InteractionResult[]> {
  const interactions = await prisma.drugInteraction.findMany({
    where: {
      OR: [
        { substanceA: { contains: substanceName, mode: "insensitive" } },
        { substanceB: { contains: substanceName, mode: "insensitive" } },
      ],
    },
    orderBy: { severity: "asc" },
  });

  // Sort by severity ranking
  return interactions.sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99),
  );
}

/**
 * Check if two specific substances have a known interaction.
 * Checks both orderings (A+B and B+A).
 *
 * @param substance1 - First substance name
 * @param substance2 - Second substance name
 * @returns The interaction if found, or null
 */
export async function checkPairInteraction(
  substance1: string,
  substance2: string,
): Promise<InteractionResult | null> {
  const interaction = await prisma.drugInteraction.findFirst({
    where: {
      OR: [
        {
          AND: [
            { substanceA: { contains: substance1, mode: "insensitive" } },
            { substanceB: { contains: substance2, mode: "insensitive" } },
          ],
        },
        {
          AND: [
            { substanceA: { contains: substance2, mode: "insensitive" } },
            { substanceB: { contains: substance1, mode: "insensitive" } },
          ],
        },
      ],
    },
  });

  return interaction;
}

/**
 * Check all pairwise interactions for a list of substances.
 * Returns all found interactions between any pair in the list.
 *
 * @param substances - Array of substance names to check
 * @returns All found interactions sorted by severity
 */
export async function checkMultipleInteractions(
  substances: string[],
): Promise<InteractionResult[]> {
  if (substances.length < 2) {
    return [];
  }

  // Build OR conditions for all pairs
  const orConditions = [];
  for (let i = 0; i < substances.length; i++) {
    for (let j = i + 1; j < substances.length; j++) {
      const s1 = substances[i];
      const s2 = substances[j];
      orConditions.push(
        {
          AND: [
            { substanceA: { contains: s1, mode: "insensitive" as const } },
            { substanceB: { contains: s2, mode: "insensitive" as const } },
          ],
        },
        {
          AND: [
            { substanceA: { contains: s2, mode: "insensitive" as const } },
            { substanceB: { contains: s1, mode: "insensitive" as const } },
          ],
        },
      );
    }
  }

  const interactions = await prisma.drugInteraction.findMany({
    where: { OR: orConditions },
  });

  // Sort by severity ranking
  return interactions.sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99),
  );
}

/**
 * Get interactions for a specific remedy by name.
 * Used on remedy detail pages to show warnings.
 *
 * @param remedyName - Name of the natural remedy
 * @returns Interactions sorted by severity
 */
export async function getInteractionsForRemedy(
  remedyName: string,
): Promise<InteractionResult[]> {
  return findInteractionsBySubstance(remedyName);
}

/** Type alias for interaction results from the database */
export type InteractionResult = {
  id: string;
  substanceA: string;
  substanceAType: string;
  substanceB: string;
  substanceBType: string;
  severity: string;
  description: string;
  mechanism: string | null;
  recommendation: string | null;
  evidence: string | null;
  sources: string[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * The remedy-side words of Drug Interactions recorded against a drug.
 *
 * The magnesium/ciprofloxacin rule lived in a seed comment and a test doing
 * exact string equality on "Ciprofloxacin" — so "Cipro", "Levofloxacin" and
 * every other fluoroquinolone escaped it, despite the test being titled after
 * the class. The DrugInteraction table already records the pair at class
 * level, curated, and until now the mapping path had never once consulted it.
 *
 * Mild interactions are not included: they inform, they do not forbid.
 */
export async function forbiddenRemedyTermsForDrug(
  drug: PolicyIdentity,
): Promise<string[][]> {
  const rows = await prisma.drugInteraction.findMany({
    where: { severity: { in: [...FORBIDDING_SEVERITIES] } },
    select: { substanceA: true, substanceB: true },
  });

  return forbiddenRemedyGroupsFor(drug, rows);
}
