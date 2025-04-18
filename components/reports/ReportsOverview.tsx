"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { ReportCard } from "./ReportCard";
import { ReportGenerator } from "./ReportGenerator";

interface Report {
  id: string;
  title: string;
  queryType: string;
  queryInput: string;
  status: string;
  createdAt: Date;
}

interface ReportsOverviewProps {
  reports: Report[];
  total: number;
}

export function ReportsOverview({
  reports: initialReports,
  total,
}: ReportsOverviewProps): React.JSX.Element {
  const [reports, setReports] = useState(initialReports);
  const [showGenerator, setShowGenerator] = useState(false);

  function handleReportCreated(report: Record<string, unknown>): void {
    const parsed: Report = {
      id: String(report.id ?? ""),
      title: String(report.title ?? ""),
      queryType: String(report.queryType ?? ""),
      queryInput: String(report.queryInput ?? ""),
      status: String(report.status ?? "completed"),
      createdAt:
        report.createdAt instanceof Date ? report.createdAt : new Date(),
    };
    setReports([parsed, ...reports]);
    setShowGenerator(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} reports total</p>
        <button
          type="button"
          onClick={() => setShowGenerator(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate your first AI-powered remedy report to get personalized
            recommendations.
          </p>
          <button
            type="button"
            onClick={() => setShowGenerator(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {showGenerator && (
        <ReportGenerator
          onCreated={handleReportCreated}
          onClose={() => setShowGenerator(false)}
        />
      )}
    </div>
  );
}
