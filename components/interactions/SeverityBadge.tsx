import { Badge } from "@/components/ui/badge";
import { severityPresentation } from "./interaction.types";

export function SeverityBadge({
  severity,
}: {
  severity: string;
}): React.ReactElement {
  // The badge variant travels with the presentation rather than being
  // re-derived here. It used to be a second switch over the same string, which
  // meant an unrecognised severity could pick up one component's fallback and
  // another's variant.
  const config = severityPresentation(severity);

  return (
    <Badge variant={config.badgeVariant} className="text-xs font-semibold">
      {config.label}
    </Badge>
  );
}
