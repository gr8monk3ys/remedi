import { Badge } from "@/components/ui/badge";
import { FavoriteToggle } from "@/components/remedy/FavoriteToggle";

interface RemedyHeroProps {
  id: string;
  name: string;
  description: string;
  category: string;
  similarityScore: number;
  matchingNutrients: string[];
}

export function RemedyHero({
  id,
  name,
  description,
  category,
  similarityScore,
  matchingNutrients,
}: RemedyHeroProps) {
  const scorePercent = Math.round(similarityScore * 100);

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            {category}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>
        </div>
        <div className="shrink-0">
          <FavoriteToggle remedyId={id} remedyName={name} />
        </div>
      </div>

      {/* Match Score and Nutrients */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        {similarityScore !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Match Score</span>
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
          <span className="text-sm text-muted-foreground mr-1">Nutrients:</span>
          {matchingNutrients.map((nutrient) => (
            <Badge key={nutrient} variant="outline" className="text-xs">
              {nutrient}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
