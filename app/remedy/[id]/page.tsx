import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Pill,
  AlertCircle,
  Beaker,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { getNaturalRemedyById, toDetailedRemedy } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BackButton } from "@/components/remedy/BackButton";
import { FavoriteToggle } from "@/components/remedy/FavoriteToggle";
import { ReviewsSection } from "@/components/remedy/ReviewsSection";
import { InteractionWarnings } from "@/components/interactions/InteractionWarnings";

// Mock data fallback (matches the API route)
const DETAILED_REMEDIES: Record<
  string,
  {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    matchingNutrients: string[];
    similarityScore: number;
    usage: string;
    dosage: string;
    precautions: string;
    scientificInfo: string;
    references: { title: string; url: string }[];
    relatedRemedies: { id: string; name: string }[];
  }
> = {
  "101": {
    id: "101",
    name: "Sunlight Exposure",
    description:
      "Natural vitamin D production through sunlight exposure on skin.",
    imageUrl: "",
    category: "Lifestyle Change",
    matchingNutrients: ["Vitamin D3"],
    similarityScore: 0.9,
    usage:
      "Spend 15-30 minutes in direct sunlight a few times a week, with arms and legs exposed.",
    dosage:
      "15-30 minutes of sun exposure to face, arms, and legs 2-3 times per week.",
    precautions:
      "Avoid sunburn. Limit exposure during peak sun hours (10 am - 4 pm).",
    scientificInfo:
      "When UVB rays from the sun hit the skin, they interact with 7-dehydrocholesterol to produce vitamin D3.",
    references: [
      {
        title: 'Vitamin D: The "sunshine" vitamin',
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3356951/",
      },
    ],
    relatedRemedies: [
      { id: "102", name: "Fatty Fish" },
      { id: "103", name: "Mushrooms" },
    ],
  },
  "102": {
    id: "102",
    name: "Fatty Fish",
    description: "Salmon, mackerel, and other fatty fish rich in vitamin D.",
    imageUrl: "",
    category: "Food Source",
    matchingNutrients: ["Vitamin D3", "Omega-3"],
    similarityScore: 0.8,
    usage:
      "Include fatty fish like salmon, mackerel, sardines, or herring in your diet regularly.",
    dosage:
      "Consuming fatty fish 2-3 times per week is recommended. A 3.5-ounce serving can provide 200-700 IU of vitamin D.",
    precautions:
      "Be mindful of mercury content in some fish. Pregnant women and young children should follow specific guidelines.",
    scientificInfo:
      "Fatty fish contain vitamin D3 (cholecalciferol), the same form your skin produces when exposed to sunlight.",
    references: [
      {
        title: "Vitamin D in Fish",
        url: "https://www.mdpi.com/2072-6643/10/12/1876",
      },
    ],
    relatedRemedies: [
      { id: "101", name: "Sunlight Exposure" },
      { id: "104", name: "Wild-Caught Fatty Fish" },
    ],
  },
  "103": {
    id: "103",
    name: "Turmeric",
    description: "Contains curcumin which has anti-inflammatory properties.",
    imageUrl: "",
    category: "Herbal Remedy",
    matchingNutrients: ["Curcumin"],
    similarityScore: 0.85,
    usage:
      "Turmeric can be used in cooking, taken as a supplement, or made into a paste for topical application.",
    dosage:
      "500-2,000 mg of turmeric extract per day. For cooking, 1-2 teaspoons of ground turmeric per day.",
    precautions:
      "May interact with blood thinners, diabetes medications, and acid-reducing medications.",
    scientificInfo:
      "Curcumin inhibits the activity of COX-2 and 5-LOX enzymes, similar to how NSAIDs work.",
    references: [
      {
        title: "Curcumin: A Review of Its Effects on Human Health",
        url: "https://www.mdpi.com/2072-6643/9/10/1047",
      },
    ],
    relatedRemedies: [
      { id: "104", name: "Ginger" },
      { id: "105", name: "Willow Bark" },
    ],
  },
  "104": {
    id: "104",
    name: "Ginger",
    description: "Root with anti-inflammatory and digestive properties.",
    imageUrl: "",
    category: "Herbal Remedy",
    matchingNutrients: ["Gingerols", "Shogaols"],
    similarityScore: 0.8,
    usage:
      "Can be used fresh, dried, powdered, or as an oil or juice. Add to foods, brew as tea, or take as a supplement.",
    dosage:
      "1-2g of ginger powder, 1-2 teaspoons of fresh ginger, or 400-500mg of extract 2-3 times daily.",
    precautions:
      "May interact with blood thinners and diabetes medications. High doses might cause mild heartburn.",
    scientificInfo:
      "Ginger contains gingerols and shogaols that have powerful anti-inflammatory and antioxidant effects.",
    references: [
      {
        title: "Ginger on Human Health: A Comprehensive Review",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7019938/",
      },
    ],
    relatedRemedies: [
      { id: "103", name: "Turmeric" },
      { id: "105", name: "Willow Bark" },
    ],
  },
};

interface RemedyPageProps {
  params: Promise<{ id: string }>;
}

async function getRemedy(id: string) {
  // Try database first
  const dbRemedy = await getNaturalRemedyById(id);
  if (dbRemedy) {
    return toDetailedRemedy(dbRemedy);
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

  const scorePercent = Math.round(remedy.similarityScore * 100);

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 md:px-8 lg:px-16">
      <div className="mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                {remedy.category}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight">
                {remedy.name}
              </h1>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                {remedy.description}
              </p>
            </div>
            <div className="shrink-0">
              <FavoriteToggle remedyId={remedy.id} remedyName={remedy.name} />
            </div>
          </div>

          {/* Match Score and Nutrients */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            {remedy.similarityScore !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Match Score
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{scorePercent}%</span>
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm text-muted-foreground mr-1">
                Nutrients:
              </span>
              {remedy.matchingNutrients.map((nutrient) => (
                <Badge key={nutrient} variant="outline" className="text-xs">
                  {nutrient}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 md:col-span-2">
            {/* Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {remedy.usage}
                </p>
              </CardContent>
            </Card>

            {/* Dosage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Pill className="h-4 w-4 text-primary" />
                  Dosage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {remedy.dosage}
                </p>
              </CardContent>
            </Card>

            {/* Precautions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Precautions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {remedy.precautions}
                </p>
              </CardContent>
            </Card>

            {/* Interaction Warnings */}
            <InteractionWarnings remedyName={remedy.name} />

            {/* Scientific Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Beaker className="h-4 w-4 text-primary" />
                  Scientific Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {remedy.scientificInfo}
                </p>
                {remedy.references.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">References</h4>
                    <ul className="space-y-1.5">
                      {remedy.references.map(
                        (
                          ref: { title: string; url: string },
                          index: number,
                        ) => (
                          <li key={index}>
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3 shrink-0" />
                              {ref.title}
                            </a>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Disclaimer */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Medical Disclaimer</AlertTitle>
              <AlertDescription>
                This information is for educational purposes only and is not
                intended as a substitute for medical advice. Always consult a
                qualified healthcare provider before using any natural remedy or
                making changes to your treatment plan.
              </AlertDescription>
            </Alert>

            {/* Reviews */}
            <ReviewsSection remedyId={id} remedyName={remedy.name} />
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Related Remedies</CardTitle>
              </CardHeader>
              <CardContent>
                {remedy.relatedRemedies.length > 0 ? (
                  <div className="space-y-2">
                    {remedy.relatedRemedies.map(
                      (related: { id: string; name: string }) => (
                        <Link
                          key={related.id}
                          href={`/remedy/${related.id}`}
                          className="group flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-accent/50"
                        >
                          <span>{related.name}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No related remedies found.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
