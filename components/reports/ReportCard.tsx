"use client";

import Link from "next/link";
import { FileText, Loader2, CheckCircle, XCircle } from "lucide-react";

interface Report {
  id: string;
  title: string;
  queryType: string;
  queryInput: string;
  status: string;
  createdAt: Date;
}

interface ReportCardProps {
  report: Report;
}

const STATUS_CONFIG: Record<
  string,
  { icon: typeof FileText; label: string; color: string }
> = {
  generating: {
    icon: Loader2,
    label: "Generating...",
    color: "text-amber-600 dark:text-amber-400",
  },
  complete: {
    icon: CheckCircle,
    label: "Complete",
    color: "text-green-600 dark:text-green-400",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    color: "text-red-600 dark:text-red-400",
  },
};

const QUERY_TYPE_LABELS: Record<string, string> = {
  condition: "Condition",
  drug_alternative: "Drug Alternative",
  custom: "Custom",
};

export function ReportCard({ report }: ReportCardProps): React.JSX.Element {
  const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.complete;
  const StatusIcon = status.icon;
  const dateStr = new Date(report.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/dashboard/reports/${report.id}`}
      className="rounded-xl border bg-card p-5 hover:border-primary/50 transition-colors block"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{report.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {report.queryInput}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {QUERY_TYPE_LABELS[report.queryType] ?? report.queryType}
            </span>
            <div className={`flex items-center gap-1 text-xs ${status.color}`}>
              <StatusIcon
                className={`w-3.5 h-3.5 ${
                  report.status === "generating" ? "animate-spin" : ""
                }`}
              />
              {status.label}
            </div>
            <span className="text-xs text-muted-foreground">{dateStr}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
