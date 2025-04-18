"use client";

import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Printer,
  Star,
} from "lucide-react";

interface ReportContent {
  summary?: string;
  recommendations?: Array<{
    name: string;
    description: string;
    evidenceLevel?: string;
    dosage?: string;
    precautions?: string[];
  }>;
  interactionWarnings?: Array<{
    substance: string;
    medication: string;
    severity: string;
    description: string;
  }>;
  sources?: Array<{
    title: string;
    url?: string;
  }>;
}

interface Report {
  id: string;
  title: string;
  queryType: string;
  queryInput: string;
  content: unknown;
  status: string;
  createdAt: Date;
}

interface ReportViewerProps {
  report: Report;
}

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  moderate:
    "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
  low: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
};

const EVIDENCE_COLORS: Record<string, string> = {
  strong: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  moderate: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  limited: "bg-muted text-muted-foreground",
  traditional:
    "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
};

export function ReportViewer({ report }: ReportViewerProps): React.JSX.Element {
  if (report.status === "generating") {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Generating Your Report</h3>
        <p className="text-sm text-muted-foreground">
          This may take a minute. Refresh the page to check for updates.
        </p>
      </div>
    );
  }

  if (report.status === "failed") {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-8 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Report Generation Failed</h3>
        <p className="text-sm text-muted-foreground">
          We were unable to generate this report. Please try again.
        </p>
      </div>
    );
  }

  const content = report.content as ReportContent;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Print button */}
      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Summary */}
      {content.summary && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-3">Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {content.summary}
          </p>
        </div>
      )}

      {/* Interaction Warnings */}
      {content.interactionWarnings &&
        content.interactionWarnings.length > 0 && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                Interaction Warnings
              </h3>
            </div>
            <div className="space-y-3">
              {content.interactionWarnings.map((warning, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-4 ${SEVERITY_COLORS[warning.severity] ?? SEVERITY_COLORS.moderate}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {warning.substance} + {warning.medication}
                    </span>
                    <span className="text-xs font-medium uppercase">
                      {warning.severity}
                    </span>
                  </div>
                  <p className="text-sm opacity-80">{warning.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Recommendations */}
      {content.recommendations && content.recommendations.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-4">
            {content.recommendations.map((rec, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <h4 className="font-semibold">{rec.name}</h4>
                  </div>
                  {rec.evidenceLevel && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${EVIDENCE_COLORS[rec.evidenceLevel.toLowerCase()] ?? EVIDENCE_COLORS.limited}`}
                    >
                      {rec.evidenceLevel}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2 ml-7">
                  {rec.description}
                </p>
                {rec.dosage && (
                  <p className="text-sm mt-2 ml-7">
                    <span className="font-medium">Dosage:</span> {rec.dosage}
                  </p>
                )}
                {rec.precautions && rec.precautions.length > 0 && (
                  <div className="mt-2 ml-7">
                    <span className="text-sm font-medium">Precautions:</span>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                      {rec.precautions.map((p, j) => (
                        <li key={j}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {content.sources && content.sources.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-3">Sources</h3>
          <ul className="space-y-2">
            {content.sources.map((source, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Star className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {source.title}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">{source.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground text-center">
          This report is for informational purposes only and should not replace
          professional medical advice. Always consult a healthcare provider
          before starting or changing any supplement or medication regimen.
        </p>
      </div>
    </div>
  );
}
