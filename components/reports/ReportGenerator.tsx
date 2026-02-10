"use client";

import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";

interface ReportGeneratorProps {
  onCreated: (report: Record<string, unknown>) => void;
  onClose: () => void;
}

export function ReportGenerator({
  onCreated,
  onClose,
}: ReportGeneratorProps): React.JSX.Element {
  const [title, setTitle] = useState("");
  const [queryType, setQueryType] = useState<string>("condition");
  const [queryInput, setQueryInput] = useState("");
  const [includeCabinetInteractions, setIncludeCabinetInteractions] =
    useState(true);
  const [includeJournalData, setIncludeJournalData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!title.trim() || !queryInput.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const data = await apiClient.post<{ report: Record<string, unknown> }>(
        "/api/reports",
        {
          title: title.trim(),
          queryType,
          queryInput: queryInput.trim(),
          includeCabinetInteractions,
          includeJournalData,
        },
      );
      onCreated(data.report);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to generate report",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl border shadow-lg w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Generate AI Report</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="r-title" className="block text-sm font-medium mb-1">
              Report Title *
            </label>
            <input
              id="r-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Natural alternatives for joint pain"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="r-type" className="block text-sm font-medium mb-1">
              Report Type
            </label>
            <select
              id="r-type"
              value={queryType}
              onChange={(e) => setQueryType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="condition">
                Natural remedies for a condition
              </option>
              <option value="drug_alternative">
                Natural alternatives to a drug
              </option>
              <option value="custom">Custom query</option>
            </select>
          </div>

          <div>
            <label htmlFor="r-query" className="block text-sm font-medium mb-1">
              {queryType === "condition"
                ? "Condition or symptom"
                : queryType === "drug_alternative"
                  ? "Drug name"
                  : "Your query"}{" "}
              *
            </label>
            <input
              id="r-query"
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={
                queryType === "condition"
                  ? "e.g. chronic joint pain, insomnia"
                  : queryType === "drug_alternative"
                    ? "e.g. ibuprofen, melatonin"
                    : "Describe what you want to learn about"
              }
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              required
            />
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCabinetInteractions}
                onChange={(e) =>
                  setIncludeCabinetInteractions(e.target.checked)
                }
                className="rounded border-border"
              />
              <div>
                <span className="text-sm font-medium">
                  Check cabinet interactions
                </span>
                <p className="text-xs text-muted-foreground">
                  Cross-reference with your medication cabinet
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeJournalData}
                onChange={(e) => setIncludeJournalData(e.target.checked)}
                className="rounded border-border"
              />
              <div>
                <span className="text-sm font-medium">
                  Include journal data
                </span>
                <p className="text-xs text-muted-foreground">
                  Factor in your tracked remedy experiences
                </p>
              </div>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !title.trim() || !queryInput.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 inline mr-2" />
              )}
              Generate Report
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
