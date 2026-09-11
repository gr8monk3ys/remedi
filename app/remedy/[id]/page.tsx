import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getNaturalRemedyById,
  resolveRelatedRemedies,
  toDetailedRemedy,
} from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/remedy/BackButton";
import { logger } from "@/lib/logger";
import { isUuid } from "@/lib/utils";
import { isDemoDataEnabled } from "@/lib/env";
import { known, unknown, type Outcome } from "@/lib/outcome";
import { DETAILED_REMEDIES } from "./mockRemedies";
import { RemedyHero } from "./RemedyHero";
import { RemedyContent } from "./RemedyContent";

interface RemedyPageProps {
  params: Promise<{ id: string }>;
}

const NUMERIC_MOCK_ID_PATTERN = /^\d+$/;

type RemedyLookup = {
  remedy: (typeof DETAILED_REMEDIES)[string];
  sourceUrl: string | null;
};

/**
 * What the lookup established.
 *
 * `known(null)` is "we looked and this remedy is not there" — a 404 is the
 * honest rendering of that. `unknown("unavailable")` is "we could not look",
 * and it must never become a 404: telling someone the page they bookmarked
 * does not exist, because Postgres was briefly unreachable, is the same
 * failure-as-an-answer collapse lib/outcome.ts exists to prevent.
 */
type RemedyOutcome = Outcome<RemedyLookup | null, "unavailable">;

function sourceUrlFromReferences(
  references: { title: string; url: string }[] | undefined,
): string | null {
  return references?.[0]?.url ?? null;
}

// Deduplicate the per-request lookup: getRemedy runs in both generateMetadata
// and the page component, so cache() collapses them into a single DB call.
const getRemedy = cache(loadRemedy);

async function loadRemedy(id: string): Promise<RemedyOutcome> {
  // Demo/mock remedies are only served when demo data is enabled (off in
  // production by default) so a real deployment never renders fabricated data.
  const demoEnabled = isDemoDataEnabled();

  // Mock remedy IDs are numeric; DB IDs are UUIDs.
  if (NUMERIC_MOCK_ID_PATTERN.test(id)) {
    const remedy = demoEnabled ? DETAILED_REMEDIES[id] || null : null;
    if (!remedy) return known(null);
    return known({
      remedy,
      sourceUrl: sourceUrlFromReferences(remedy.references),
    });
  }

  // Only valid UUIDs exist in the database. Querying Postgres with a non-UUID
  // id (e.g. a mock slug) throws an invalid-input error, so skip straight to
  // the mock fallback for those. Mirrors the guard in app/api/remedy/[id].
  if (isUuid(id)) {
    try {
      const dbRemedy = await getNaturalRemedyById(id);
      if (dbRemedy) {
        // Related remedies are stored as names; resolve them to IDs so the
        // sidebar links point at real pages instead of 404ing.
        const related = await resolveRelatedRemedies(dbRemedy.relatedRemedies);
        const remedy = toDetailedRemedy(dbRemedy, 1.0, related);
        return known({
          remedy,
          sourceUrl:
            dbRemedy.sourceUrl || sourceUrlFromReferences(remedy.references),
        });
      }
    } catch (error) {
      // The database is the only place a UUID-keyed remedy can come from, so
      // a failure here is a failure to answer — not evidence of absence. Demo
      // data is a stand-in for an empty catalogue, never for an outage; the
      // search resolver makes the same distinction for the same reason.
      logger.error("Database unavailable for remedy lookup", { id, error });
      return unknown(
        "unavailable",
        "We could not load this remedy just now. Please try again.",
      );
    }
  }

  // Fallback to mock data (demo only)
  const remedy = demoEnabled ? DETAILED_REMEDIES[id] || null : null;
  if (!remedy) return known(null);
  return known({
    remedy,
    sourceUrl: sourceUrlFromReferences(remedy.references),
  });
}

/**
 * Raised when a tier we depend on could not be reached.
 *
 * Thrown from the page so Next's error boundary (./error.tsx) renders, which
 * offers Try Again and reports to Sentry. `notFound()` would render
 * "Page Not Found" — a confident statement about a fact we do not have.
 */
class RemedyUnavailable extends Error {}

export async function generateMetadata({
  params,
}: RemedyPageProps): Promise<Metadata> {
  const { id } = await params;
  const outcome = await getRemedy(id);

  // An outage must not produce a "Not Found" title either — that string gets
  // cached, shared and indexed as a statement that the remedy is gone.
  if (outcome.kind === "unknown") {
    return { title: "Remedy temporarily unavailable" };
  }

  const remedy = outcome.data?.remedy ?? null;

  if (!remedy) {
    return {
      title: "Remedy Not Found",
    };
  }

  return {
    title: remedy.name,
    description: remedy.description,
    openGraph: {
      title: `${remedy.name} - Natural Remedy`,
      description: remedy.description,
    },
  };
}

export default async function RemedyDetailPage({ params }: RemedyPageProps) {
  const { id } = await params;
  const outcome = await getRemedy(id);

  if (outcome.kind === "unknown") {
    throw new RemedyUnavailable(outcome.message);
  }

  const remedy = outcome.data?.remedy ?? null;
  const sourceUrl = outcome.data?.sourceUrl ?? null;

  if (!remedy) {
    notFound();
  }

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-6">
          <BackButton />
        </div>

        <RemedyHero
          id={remedy.id}
          name={remedy.name}
          description={remedy.description}
          category={remedy.category}
          similarityScore={remedy.similarityScore}
          matchingNutrients={remedy.matchingNutrients}
          evidenceLevel={remedy.evidenceLevel}
        />

        <Separator className="mb-8" />

        <RemedyContent
          id={id}
          name={remedy.name}
          usage={remedy.usage}
          dosage={remedy.dosage}
          precautions={remedy.precautions}
          scientificInfo={remedy.scientificInfo}
          references={remedy.references}
          sourceUrl={sourceUrl}
          relatedRemedies={remedy.relatedRemedies}
        />
      </div>
    </div>
  );
}
