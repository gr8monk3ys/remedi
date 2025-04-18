"use client";

import { Info, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CheckResponse } from "./interaction.types";
import { InteractionCard } from "./InteractionCard";

export function InteractionResults({
  results,
}: {
  results: CheckResponse;
}): React.ReactElement {
  return (
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
            <InteractionCard key={interaction.id} interaction={interaction} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-10 w-10 text-green-500 mb-3" />
            <h3 className="text-lg font-medium">No Known Interactions Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              No interactions were found between the substances you listed in
              our database. This does not guarantee there are no interactions --
              always consult your healthcare provider.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
