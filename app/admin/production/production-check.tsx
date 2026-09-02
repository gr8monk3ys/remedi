"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";

type Result = {
  ok: boolean;
  missingRequired: string[];
  missingRecommended: string[];
  dbOk: boolean;
};

export function ProductionCheckButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      // apiClient carries the CSRF token; the middleware rejects a bare POST.
      setResult(await apiClient.post<Result>("/api/admin/production-check"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Production check</p>
          <p className="text-lg font-semibold text-foreground">
            {result ? (result.ok ? "Ready" : "Needs work") : "Not run"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runCheck()}
          className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-muted"
          disabled={loading}
        >
          {loading ? "Running..." : "Run checks"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p>
      )}
      {result && (
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <p>DB: {result.dbOk ? "OK" : "Failed"}</p>
          <p>Missing required: {result.missingRequired.length}</p>
          <p>Missing recommended: {result.missingRecommended.length}</p>
        </div>
      )}
    </div>
  );
}
