import { Badge } from "@/components/ui/badge";
import { FavoriteToggle } from "@/components/remedy/FavoriteToggle";
import { EvidenceBadge } from "@/components/remedy/EvidenceBadge";

interface RemedyHeroProps {
  id: string;
  name: string;
  description: string;
  category: string;
  similarityScore: number;
  matchingNutrients: string[];
  evidenceLevel?: string | null;
}

export function RemedyHero({
  id,
  name,
  description,
  category,
  similarityScore,
  matchingNutrients,
  evidenceLevel,
}: RemedyHeroProps) {
  const scorePercent = Math.round(similarityScore * 100);

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{category}</Badge>
            <EvidenceBadge level={evidenceLevel} />
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{name}</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="shrink-0">
          <FavoriteToggle remedyId={id} remedyName={name} />
        </div>
      </div>

      {/* Relevance and Nutrients */}
      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
        {similarityScore !== undefined && (
          <div
            className="flex items-center gap-3"
            title="Relevance reflects shared ingredients and properties — it is informational only and is not a measure of medical effectiveness."
          >
            <span className="eyebrow eyebrow-muted">Relevance</span>
            <div className="flex items-center gap-2">
              <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <span className="tabular font-mono text-xs font-medium">
                {scorePercent}%
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="eyebrow eyebrow-muted mr-1">Nutrients:</span>
          {matchingNutrients.map((nutrient) => (
            <Badge key={nutrient} variant="outline">
              {nutrient}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
