"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, Plus, X, Search, Shield } from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CheckResponse } from "./interaction.types";
import { InteractionResults } from "./InteractionResults";

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
      const data = await apiClient.post<CheckResponse>(
        "/api/interactions/check",
        { substances },
      );
      setResults(data);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to check interactions. Please try again.",
      );
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
      {results && <InteractionResults results={results} />}

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
