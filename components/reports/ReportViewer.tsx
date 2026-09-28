"use client";

import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Printer,
  Star,
} from "lucide-react";
import { getEvidenceMeta, UNCLASSIFIED_EVIDENCE } from "@/lib/evidence-levels";
import { severityPresentation } from "@/components/interactions/interaction.types";

/**
 * Evidence colours come from the shared config so a "Moderate" remedy does not
 * appear in one colour here and another on its detail page.
 */
function evidenceClasses(level?: string | null): string {
  const meta = getEvidenceMeta(level) ?? UNCLASSIFIED_EVIDENCE;
  return `${meta.bgClassName} ${meta.textClassName}`;
}

/**
 * The shape `lib/ai/report-generator.ts` stores. Keep the two in step: a field
 * read here that the generator never writes renders as nothing, silently.
 */
interface ReportContent {
  summary?: string;
  recommendations?: Array<{
    name: string;
    category?: string;
    evidenceLevel?: string;
    reasoning?: string;
    dosage?: string;
    warnings?: string[];
  }>;
  /**
   * Whether the Medication Cabinet was checked. Absent on reports that did not
   * ask for it, and on reports generated before this field existed.
   */
  interactionCheck?: "checked" | "unavailable";
  interactionWarnings?: Array<{
    substanceA: string;
    substanceB: string;
    severity: string;
    description: string;
    recommendation?: string;
  }>;
  sources?: Array<string | { title: string; url?: string }>;
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

export function ReportViewer({ report }: ReportViewerProps): React.JSX.Element {
  if (report.status === "generating") {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
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
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-destructive" />
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
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-3">Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {content.summary}
          </p>
        </div>
      )}

      {/* Interaction Warnings */}
      {content.interactionCheck === "unavailable" && (
        <div
          role="alert"
          className="rounded-lg border border-warning/30 bg-warning/5 p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle
              aria-hidden="true"
              className="h-5 w-5 text-warning"
            />
            <h3 className="text-lg font-semibold text-foreground">
              Interactions Not Checked
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            We could not check your medication cabinet for interactions when
            this report was generated. This is not a confirmation that none
            exist. Use the interaction checker or ask a pharmacist.
          </p>
        </div>
      )}

      {content.interactionCheck === "checked" &&
        (content.interactionWarnings?.length ?? 0) === 0 && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Interaction Warnings</h3>
            <p className="text-sm text-muted-foreground">
              No known interactions were found between the medications in your
              cabinet in our database. This does not guarantee the absence of
              interactions.
            </p>
          </div>
        )}

      {content.interactionWarnings &&
        content.interactionWarnings.length > 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle
                aria-hidden="true"
                className="h-5 w-5 text-warning"
              />
              <h3 className="text-lg font-semibold text-foreground">
                Interaction Warnings
              </h3>
            </div>
            <div className="space-y-3">
              {content.interactionWarnings.map((warning, i) => {
                const severity = severityPresentation(warning.severity);
                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 ${severity.borderColor} ${severity.bgColor}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {warning.substanceA} + {warning.substanceB}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${severity.color}`}
                      >
                        <severity.icon
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />
                        {severity.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {warning.description}
                    </p>
                    {warning.recommendation && (
                      <p className="text-sm mt-2">{warning.recommendation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Recommendations */}
      {content.recommendations && content.recommendations.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-4">
            {content.recommendations.map((rec, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 shrink-0 text-primary" />
                    <h4 className="font-semibold">{rec.name}</h4>
                  </div>
                  {rec.evidenceLevel && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${evidenceClasses(rec.evidenceLevel)}`}
                    >
                      {rec.evidenceLevel}
                    </span>
                  )}
                </div>
                {rec.reasoning && (
                  <p className="text-sm text-muted-foreground mt-2 ml-7">
                    {rec.reasoning}
                  </p>
                )}
                {rec.dosage && (
                  <p className="text-sm mt-2 ml-7">
                    <span className="font-medium">Dosage:</span> {rec.dosage}
                  </p>
                )}
                {rec.warnings && rec.warnings.length > 0 && (
                  <div className="mt-2 ml-7">
                    <span className="text-sm font-medium">Warnings:</span>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                      {rec.warnings.map((p, j) => (
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
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-3">Sources</h3>
          <ul className="space-y-2">
            {content.sources.map((entry, i) => {
              const source =
                typeof entry === "string"
                  ? { title: entry, url: undefined }
                  : entry;
              return (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Star
                    aria-hidden="true"
                    className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0"
                  />
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {source.title}
                      <ExternalLink aria-hidden="true" className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">
                      {source.title}
                    </span>
                  )}
                </li>
              );
            })}
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
