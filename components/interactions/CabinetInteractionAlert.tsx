"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import Link from "next/link";

interface Interaction {
  substance1: string;
  substance2: string;
  severity: string;
  description: string;
}

interface CabinetInteractionAlertProps {
  remedyName: string;
}

export function CabinetInteractionAlert({
  remedyName,
}: CabinetInteractionAlertProps): React.JSX.Element | null {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function check(): Promise<void> {
      try {
        const res = await fetch("/api/medication-cabinet/interactions");
        if (res.status === 403) {
          setHasAccess(false);
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (json.success) {
          setHasAccess(true);
          const relevant = (json.data.interactions as Interaction[]).filter(
            (i) =>
              i.substance1.toLowerCase() === remedyName.toLowerCase() ||
              i.substance2.toLowerCase() === remedyName.toLowerCase(),
          );
          setInteractions(relevant);
        }
      } catch {
        // Silently fail — cabinet interactions are optional
      } finally {
        setLoading(false);
      }
    }

    check();
  }, [remedyName]);

  if (loading) return null;
  if (!hasAccess) return null;
  if (interactions.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-3 flex items-center gap-2">
        <Shield className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-700 dark:text-green-300">
          No interactions found with your medication cabinet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-200">
          Cabinet Interaction Alert
        </h4>
      </div>
      {interactions.map((interaction, i) => {
        const other =
          interaction.substance1.toLowerCase() === remedyName.toLowerCase()
            ? interaction.substance2
            : interaction.substance1;
        return (
          <div key={i} className="text-sm">
            <span className="font-medium text-amber-800 dark:text-amber-200">
              {other}
            </span>
            <span className="text-amber-700 dark:text-amber-300">
              {" "}
              — {interaction.severity} severity
            </span>
            <p className="text-amber-600 dark:text-amber-400 mt-0.5">
              {interaction.description}
            </p>
          </div>
        );
      })}
      <Link
        href="/dashboard/health-profile"
        className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
      >
        Manage your medication cabinet
      </Link>
    </div>
  );
}
