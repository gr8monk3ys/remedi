"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  AlertTriangle,
  Pill,
  Leaf,
  FlaskConical,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MedicationForm } from "./MedicationForm";

interface Medication {
  id: string;
  name: string;
  type: string;
  dosage: string | null;
  frequency: string | null;
  startDate: string | null;
  notes: string | null;
  isActive: boolean;
}

interface MedicationCabinetListProps {
  initialMedications: Medication[];
}

const TYPE_ICONS: Record<string, typeof Pill> = {
  pharmaceutical: Pill,
  supplement: FlaskConical,
  natural_remedy: Leaf,
};

const TYPE_LABELS: Record<string, string> = {
  pharmaceutical: "Pharmaceutical",
  supplement: "Supplement",
  natural_remedy: "Natural Remedy",
};

const FREQ_LABELS: Record<string, string> = {
  daily: "Daily",
  twice_daily: "Twice daily",
  as_needed: "As needed",
  weekly: "Weekly",
};

export function MedicationCabinetList({
  initialMedications,
}: MedicationCabinetListProps): React.JSX.Element {
  const [medications, setMedications] =
    useState<Medication[]>(initialMedications);
  const [showForm, setShowForm] = useState(false);
  const [interactions, setInteractions] = useState<
    Array<{
      substanceA: string;
      substanceB: string;
      severity: string;
      description: string;
    }>
  >([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(data: Record<string, unknown>): Promise<void> {
    const res = await fetch("/api/medication-cabinet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        setMedications([...medications, json.data.medication]);
        setShowForm(false);
      }
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/medication-cabinet?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMedications(medications.filter((m) => m.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function checkInteractions(): Promise<void> {
    setLoadingInteractions(true);
    try {
      const res = await fetch("/api/medication-cabinet/interactions");
      const json = await res.json();
      if (json.success) {
        setInteractions(json.data.interactions);
      }
    } finally {
      setLoadingInteractions(false);
    }
  }

  const activeMeds = medications.filter((m) => m.isActive);

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Medication Cabinet</h2>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Medication
        </button>
      </div>

      {/* Interaction Alerts */}
      {interactions.length > 0 && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Interaction Alerts</span>
          </div>
          {interactions.map((interaction, i) => (
            <div
              key={i}
              className="text-sm text-red-700 dark:text-red-400 pl-7"
            >
              <span className="font-medium">
                {interaction.substanceA} + {interaction.substanceB}
              </span>{" "}
              ({interaction.severity}): {interaction.description}
            </div>
          ))}
        </div>
      )}

      {/* Check Interactions Button */}
      {activeMeds.length >= 2 && (
        <button
          type="button"
          onClick={checkInteractions}
          disabled={loadingInteractions}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          {loadingInteractions ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          Check Interactions
        </button>
      )}

      {/* Medication List */}
      {medications.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No medications added yet. Add your current medications to get
          interaction alerts.
        </p>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => {
            const Icon = TYPE_ICONS[med.type] ?? Pill;
            return (
              <div
                key={med.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border",
                  !med.isActive && "opacity-60",
                )}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{med.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {TYPE_LABELS[med.type] ?? med.type}
                    </span>
                    {!med.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {med.dosage && <span>{med.dosage}</span>}
                    {med.dosage && med.frequency && <span> &middot; </span>}
                    {med.frequency && (
                      <span>{FREQ_LABELS[med.frequency] ?? med.frequency}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(med.id)}
                  disabled={deletingId === med.id}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors"
                >
                  {deletingId === med.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Medication Dialog */}
      {showForm && (
        <MedicationForm
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
