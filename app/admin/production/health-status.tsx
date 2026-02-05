"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  timestamp?: string;
  services?: Record<string, { status: string; message?: string; latency?: number }>;
};

export function HealthStatus() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health?verbose=true");
      if (!res.ok) {
        throw new Error(`Health check failed (${res.status})`);
      }
      const json = (await res.json()) as HealthResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Health check failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-100 dark:border-gray-700 px-4 py-3 text-sm text-gray-500">
        Loading /api/health status...
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
    <div className="rounded-lg border border-gray-100 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">/api/health</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {data?.status || "unknown"}
          </p>
          {data?.services && (
            <div className="mt-2 grid md:grid-cols-3 gap-2 text-xs">
              {Object.entries(data.services).map(([name, value]) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="capitalize text-gray-500 dark:text-gray-400">
                    {name}:
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {value.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => void fetchHealth()}
          className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
