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

async function getRemedy(id: string) {
  // Try database first, fall back to mock data on error
  try {
    const dbRemedy = await getNaturalRemedyById(id);
    if (dbRemedy) {
      return toDetailedRemedy(dbRemedy);
    }
  } catch (error) {
    logger.warn(
      "Database unavailable for remedy lookup, falling back to mock data",
      { id, error },
    );
  }

  // Fallback to mock data
  return DETAILED_REMEDIES[id] || null;
}

export async function generateMetadata({
  params,
}: RemedyPageProps): Promise<Metadata> {
  const { id } = await params;
  const remedy = await getRemedy(id);

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
  const remedy = await getRemedy(id);

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
          relatedRemedies={remedy.relatedRemedies}
        />
      </div>
    </div>
  );
}
