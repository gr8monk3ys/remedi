import { Badge } from "@/components/ui/badge";
import { SEVERITY_CONFIG } from "./interaction.types";

export function SeverityBadge({
  severity,
}: {
  severity: string;
}): React.ReactElement {
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
