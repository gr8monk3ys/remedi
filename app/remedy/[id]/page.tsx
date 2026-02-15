import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNaturalRemedyById, toDetailedRemedy } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/remedy/BackButton";
import { logger } from "@/lib/logger";
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

function sourceUrlFromReferences(
  references: { title: string; url: string }[] | undefined,
): string | null {
  return references?.[0]?.url ?? null;
}

async function getRemedy(id: string): Promise<RemedyLookup | null> {
  // Mock remedy IDs are numeric; DB IDs are UUIDs.
  if (NUMERIC_MOCK_ID_PATTERN.test(id)) {
    const remedy = DETAILED_REMEDIES[id] || null;
    if (!remedy) return null;
    return {
      remedy,
      sourceUrl: sourceUrlFromReferences(remedy.references),
    };
  }

  // Try database first, fall back to mock data on error
  try {
    const dbRemedy = await getNaturalRemedyById(id);
    if (dbRemedy) {
      const remedy = toDetailedRemedy(dbRemedy);
      return {
        remedy,
        sourceUrl:
          dbRemedy.sourceUrl || sourceUrlFromReferences(remedy.references),
      };
    }
  } catch (error) {
    logger.warn(
      "Database unavailable for remedy lookup, falling back to mock data",
      { id, error },
    );
  }

  // Fallback to mock data
  const remedy = DETAILED_REMEDIES[id] || null;
  if (!remedy) return null;
  return {
    remedy,
    sourceUrl: sourceUrlFromReferences(remedy.references),
  };
}

export async function generateMetadata({
  params,
}: RemedyPageProps): Promise<Metadata> {
  const { id } = await params;
  const lookup = await getRemedy(id);
  const remedy = lookup?.remedy ?? null;

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
  const lookup = await getRemedy(id);
  const remedy = lookup?.remedy ?? null;
  const sourceUrl = lookup?.sourceUrl ?? null;

  if (!remedy) {
    notFound();
  }

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 md:px-8 lg:px-16">
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
