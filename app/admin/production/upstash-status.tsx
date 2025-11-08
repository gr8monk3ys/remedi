"use client";

import { useEffect, useState } from "react";

type UpstashStatusResponse = {
  ok: boolean;
  latencyMs?: number;
  message?: string;
};

export function UpstashStatus() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UpstashStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/upstash-status");
      if (!res.ok) {
        throw new Error(`Upstash status failed (${res.status})`);
      }
      const json = (await res.json()) as UpstashStatusResponse;
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load Upstash status",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
        Loading Upstash status...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-300">
        {error}
      </div>
    );
  }

  const statusText = data?.ok
    ? `${data.latencyMs ?? 0}ms`
    : "Not configured / unreachable";

  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Upstash Redis</p>
          <p className="text-lg font-semibold text-foreground">{statusText}</p>
          {!data?.ok && data?.message && (
            <p className="text-xs text-muted-foreground mt-1">{data.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-muted"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
