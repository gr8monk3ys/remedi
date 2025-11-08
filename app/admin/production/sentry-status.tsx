"use client";

import { useEffect, useState } from "react";

type SentryStats = {
  ok: boolean;
  errorCount24h?: number;
  lastEventAt?: string | null;
  message?: string;
};

export function SentryStatus() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SentryStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sentry-stats");
      if (!res.ok) {
        throw new Error(`Sentry stats failed (${res.status})`);
      }
      const json = (await res.json()) as SentryStats;
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load Sentry stats",
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
        Loading Sentry stats...
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

  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Sentry (24h)</p>
          <p className="text-lg font-semibold text-foreground">
            {data?.ok ? `${data?.errorCount24h ?? 0} events` : "Unavailable"}
          </p>
          {data?.lastEventAt && (
            <p className="text-xs text-muted-foreground">
              Last event: {new Date(data.lastEventAt).toLocaleString()}
            </p>
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
      {!data?.ok && data?.message && (
        <p className="text-xs text-muted-foreground mt-2">{data.message}</p>
      )}
    </div>
  );
}
