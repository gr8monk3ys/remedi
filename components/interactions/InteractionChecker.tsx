"use client";

import { useState, useCallback } from "react";
import {
  AlertTriangle,
  Plus,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** Interaction data returned from the API */
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

/** API response shape for the check endpoint */
interface CheckResponse {
  interactions: Interaction[];
  substancesChecked: string[];
  pairsChecked: number;
  interactionsFound: number;
}

/** Severity configuration for visual styling */
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

/** Evidence level labels */
const EVIDENCE_LABELS: Record<string, string> = {
  established: "Established",
  theoretical: "Theoretical",
  case_report: "Case Report",
};

function SeverityBadge({ severity }: { severity: string }): React.ReactElement {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.mild!;

  const badgeVariant =
    severity === "contraindicated" || severity === "severe"
      ? "destructive"
      : severity === "moderate"
        ? "default"
        : "secondary";

  return (
    <Badge variant={badgeVariant} className="text-xs font-semibold">
      {config.label}
    </Badge>
  );
}

function InteractionCard({
  interaction,
}: {
  interaction: Interaction;
}): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[interaction.severity] || SEVERITY_CONFIG.mild!;

  return (
    <Card className={`${config.borderColor} border-l-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className={`h-4 w-4 shrink-0 ${config.color}`} />
              <span>
                {interaction.substanceA} + {interaction.substanceB}
              </span>
            </CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SeverityBadge severity={interaction.severity} />
              {interaction.evidence && (
                <Badge variant="outline" className="text-xs">
                  {EVIDENCE_LABELS[interaction.evidence] ||
                    interaction.evidence}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {interaction.description}
        </p>

        {expanded && (
          <div className="mt-4 space-y-4">
            {interaction.mechanism && (
              <div>
                <h4 className="text-sm font-medium mb-1">Mechanism</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interaction.mechanism}
                </p>
              </div>
            )}

            {interaction.recommendation && (
              <div
                className={`rounded-lg p-3 ${config.bgColor} ${config.borderColor} border`}
              >
                <h4 className={`text-sm font-medium mb-1 ${config.color}`}>
                  Recommendation
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interaction.recommendation}
                </p>
              </div>
            )}

            {interaction.sources.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Sources</h4>
                <ul className="space-y-1">
                  {interaction.sources.map((source, index) => (
                    <li
                      key={index}
                      className="text-xs text-muted-foreground leading-relaxed"
                    >
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InteractionChecker(): React.ReactElement {
  const [substances, setSubstances] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<CheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSubstance = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (substances.includes(trimmed)) {
      setError("This substance has already been added.");
      return;
    }
    if (substances.length >= 20) {
      setError("You can check up to 20 substances at once.");
      return;
    }
    setSubstances((prev) => [...prev, trimmed]);
    setInputValue("");
    setError(null);
  }, [inputValue, substances]);

  const removeSubstance = useCallback((index: number) => {
    setSubstances((prev) => prev.filter((_, i) => i !== index));
    setResults(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSubstance();
      }
    },
    [addSubstance],
  );

  const checkInteractions = useCallback(async () => {
    if (substances.length < 2) {
      setError("Add at least two substances to check for interactions.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/interactions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ substances }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || "Failed to check interactions.");
        return;
      }

      setResults(data.data);
    } catch {
      setError("Failed to check interactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [substances]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Drug Interaction Checker
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the medications, supplements, and natural remedies you
            currently take to check for potential interactions.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add substance input */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter a medication or supplement name..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              aria-label="Substance name"
            />
            <Button
              onClick={addSubstance}
              variant="outline"
              disabled={!inputValue.trim()}
              aria-label="Add substance"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Substance list */}
          {substances.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {substances.map((substance, index) => (
                <Badge
                  key={`${substance}-${index}`}
                  variant="secondary"
                  className="flex items-center gap-1 py-1 pl-2.5 pr-1"
                >
                  {substance}
                  <button
                    onClick={() => removeSubstance(index)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    aria-label={`Remove ${substance}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Check button */}
          <Button
            onClick={checkInteractions}
            disabled={substances.length < 2 || loading}
            className="w-full sm:w-auto"
          >
            <Search className="h-4 w-4" />
            {loading ? "Checking..." : "Check Interactions"}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <Info className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="text-sm">
              <p className="text-muted-foreground">
                Checked{" "}
                <span className="font-medium text-foreground">
                  {results.pairsChecked} pairs
                </span>{" "}
                across{" "}
                <span className="font-medium text-foreground">
                  {results.substancesChecked.length} substances
                </span>
                .
                {results.interactionsFound > 0 ? (
                  <>
                    {" "}
                    Found{" "}
                    <span className="font-medium text-foreground">
                      {results.interactionsFound}{" "}
                      {results.interactionsFound === 1
                        ? "interaction"
                        : "interactions"}
                    </span>
                    .
                  </>
                ) : (
                  <> No known interactions found in our database.</>
                )}
              </p>
            </div>
          </div>

          {/* Interaction cards */}
          {results.interactions.length > 0 ? (
            <div className="space-y-4">
              {results.interactions.map((interaction) => (
                <InteractionCard
                  key={interaction.id}
                  interaction={interaction}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Shield className="h-10 w-10 text-green-500 mb-3" />
                <h3 className="text-lg font-medium">
                  No Known Interactions Found
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  No interactions were found between the substances you listed
                  in our database. This does not guarantee there are no
                  interactions -- always consult your healthcare provider.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Medical Disclaimer</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            This interaction checker is for informational purposes only and is
            not a substitute for professional medical advice. Our database may
            not include all known interactions.
          </p>
          <p>
            Always consult a qualified healthcare provider or pharmacist before
            starting, stopping, or changing any medication or supplement. Bring
            a complete list of everything you take to every medical appointment.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
