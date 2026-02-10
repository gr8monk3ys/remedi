"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SEVERITY_CONFIG,
  EVIDENCE_LABELS,
  type Interaction,
} from "./interaction.types";
import { SeverityBadge } from "./SeverityBadge";

export function InteractionCard({
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
