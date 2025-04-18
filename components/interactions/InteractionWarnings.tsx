"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Interaction {
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
}

interface InteractionWarningsProps {
  remedyName: string;
}

const SEVERITY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  contraindicated: {
    label: "Contraindicated",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950",
    borderColor: "border-red-300 dark:border-red-800",
  },
  severe: {
    label: "Severe",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    borderColor: "border-red-200 dark:border-red-900",
  },
  moderate: {
    label: "Moderate",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    borderColor: "border-orange-200 dark:border-orange-900",
  },
  mild: {
    label: "Mild",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
    borderColor: "border-yellow-200 dark:border-yellow-900",
  },
};

const EVIDENCE_LABELS: Record<string, string> = {
  established: "Established",
  theoretical: "Theoretical",
  case_report: "Case Report",
};

function WarningItem({
  interaction,
  remedyName,
}: {
  interaction: Interaction;
  remedyName: string;
}): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[interaction.severity] || SEVERITY_CONFIG.mild!;

  // Determine the "other" substance (the one that isn't this remedy)
  const otherSubstance = interaction.substanceA
    .toLowerCase()
    .includes(remedyName.toLowerCase())
    ? interaction.substanceB
    : interaction.substanceA;

  return (
    <div className={`rounded-lg border p-3 ${config.borderColor}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{otherSubstance}</span>
            <Badge
              variant={
                interaction.severity === "contraindicated" ||
                interaction.severity === "severe"
                  ? "destructive"
                  : interaction.severity === "moderate"
                    ? "default"
                    : "secondary"
              }
              className="text-xs"
            >
              {config.label}
            </Badge>
            {interaction.evidence && (
              <Badge variant="outline" className="text-xs">
                {EVIDENCE_LABELS[interaction.evidence] || interaction.evidence}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {interaction.description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 h-7 w-7 p-0"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse details" : "Expand details"}
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 border-t pt-3">
          {interaction.mechanism && (
            <div>
              <h5 className="text-xs font-medium mb-0.5">Mechanism</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {interaction.mechanism}
              </p>
            </div>
          )}
          {interaction.recommendation && (
            <div className={`rounded p-2 ${config.bgColor}`}>
              <h5 className={`text-xs font-medium mb-0.5 ${config.color}`}>
                Recommendation
              </h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {interaction.recommendation}
              </p>
            </div>
          )}
          {interaction.sources.length > 0 && (
            <div>
              <h5 className="text-xs font-medium mb-0.5">Sources</h5>
              <ul className="space-y-0.5">
                {interaction.sources.map((source, index) => (
                  <li key={index} className="text-xs text-muted-foreground">
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function InteractionWarnings({
  remedyName,
}: InteractionWarningsProps): React.ReactElement | null {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchInteractions(): Promise<void> {
      try {
        const response = await fetch(
          `/api/interactions?substance=${encodeURIComponent(remedyName)}`,
        );
        const data = await response.json();

        if (cancelled) return;

        if (data.success && data.data) {
          setInteractions(data.data);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchInteractions();

    return () => {
      cancelled = true;
    };
  }, [remedyName]);

  // Don't render the section if loading, errored, or no interactions
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-amber-500" />
            Interaction Warnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null;
  }

  if (interactions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-green-500" />
            Interaction Warnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No known drug interactions found for {remedyName} in our database.
            This does not guarantee the absence of interactions. Always consult
            your healthcare provider.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Count by severity for the summary
  const severityCounts = interactions.reduce(
    (acc, i) => {
      acc[i.severity] = (acc[i.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const hasSevereOrContraindicated =
    (severityCounts.severe || 0) + (severityCounts.contraindicated || 0) > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle
            className={`h-4 w-4 ${
              hasSevereOrContraindicated ? "text-red-500" : "text-amber-500"
            }`}
          />
          Interaction Warnings ({interactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasSevereOrContraindicated && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This remedy has known severe or contraindicated interactions with
              certain medications. Consult your healthcare provider before use.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {interactions.map((interaction) => (
            <WarningItem
              key={interaction.id}
              interaction={interaction}
              remedyName={remedyName}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
