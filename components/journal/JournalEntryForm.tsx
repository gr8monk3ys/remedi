"use client";

import { useState } from "react";
import { X, Loader2, Star, Plus } from "lucide-react";

interface JournalEntryFormProps {
  onSubmit: (entry: Record<string, unknown>) => void;
  onClose: () => void;
  defaultRemedyId?: string;
  defaultRemedyName?: string;
}

export function JournalEntryForm({
  onSubmit,
  onClose,
  defaultRemedyId = "",
  defaultRemedyName = "",
}: JournalEntryFormProps): React.JSX.Element {
  const [remedyId, setRemedyId] = useState(defaultRemedyId);
  const [remedyName, setRemedyName] = useState(defaultRemedyName);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rating, setRating] = useState(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [dosageTaken, setDosageTaken] = useState("");
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [newSymptom, setNewSymptom] = useState("");
  const [newSideEffect, setNewSideEffect] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!remedyName.trim()) return;

    setSubmitting(true);
    setError(null);

    const body = {
      remedyId: remedyId || crypto.randomUUID(),
      remedyName: remedyName.trim(),
      date,
      rating,
      symptoms,
      sideEffects,
      dosageTaken: dosageTaken || null,
      notes: notes || null,
      mood,
      energyLevel,
      sleepQuality,
    };

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        onSubmit(json.data.entry);
      } else {
        setError(json.error?.message ?? "Failed to create entry");
      }
    } catch {
      setError("Failed to create entry");
    } finally {
      setSubmitting(false);
    }
  }

  function RatingSelector({
    value,
    onChange,
    label,
  }: {
    value: number | null;
    onChange: (v: number | null) => void;
    label: string;
  }): React.JSX.Element {
    return (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(value === i ? null : i)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                value !== null && i <= value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="bg-card rounded-xl border shadow-lg w-full max-w-lg mx-4 my-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">New Journal Entry</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="j-remedy"
                className="block text-sm font-medium mb-1"
              >
                Remedy Name *
              </label>
              <input
                id="j-remedy"
                type="text"
                value={remedyName}
                onChange={(e) => {
                  setRemedyName(e.target.value);
                  if (!remedyId) setRemedyId("");
                }}
                placeholder="e.g. Turmeric"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="j-date"
                className="block text-sm font-medium mb-1"
              >
                Date
              </label>
              <input
                id="j-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              />
            </div>
          </div>

          {/* Effectiveness Rating */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Effectiveness
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      i <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30 hover:text-amber-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="j-dosage"
              className="block text-sm font-medium mb-1"
            >
              Dosage Taken
            </label>
            <input
              id="j-dosage"
              type="text"
              value={dosageTaken}
              onChange={(e) => setDosageTaken(e.target.value)}
              placeholder="e.g. 500mg"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Symptoms Addressed
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {symptoms.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setSymptoms(symptoms.filter((x) => x !== s))}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = newSymptom.trim();
                    if (v && !symptoms.includes(v)) {
                      setSymptoms([...symptoms, v]);
                    }
                    setNewSymptom("");
                  }
                }}
                placeholder="Add symptom..."
                className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const v = newSymptom.trim();
                  if (v && !symptoms.includes(v)) {
                    setSymptoms([...symptoms, v]);
                  }
                  setNewSymptom("");
                }}
                className="px-2 py-1.5 rounded-lg bg-muted hover:bg-muted/80"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Side Effects */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Side Effects
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {sideEffects.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() =>
                      setSideEffects(sideEffects.filter((x) => x !== s))
                    }
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSideEffect}
                onChange={(e) => setNewSideEffect(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = newSideEffect.trim();
                    if (v && !sideEffects.includes(v)) {
                      setSideEffects([...sideEffects, v]);
                    }
                    setNewSideEffect("");
                  }
                }}
                placeholder="Add side effect..."
                className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const v = newSideEffect.trim();
                  if (v && !sideEffects.includes(v)) {
                    setSideEffects([...sideEffects, v]);
                  }
                  setNewSideEffect("");
                }}
                className="px-2 py-1.5 rounded-lg bg-muted hover:bg-muted/80"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Wellbeing Scales */}
          <div className="grid grid-cols-3 gap-4">
            <RatingSelector value={mood} onChange={setMood} label="Mood" />
            <RatingSelector
              value={energyLevel}
              onChange={setEnergyLevel}
              label="Energy"
            />
            <RatingSelector
              value={sleepQuality}
              onChange={setSleepQuality}
              label="Sleep"
            />
          </div>

          <div>
            <label htmlFor="j-notes" className="block text-sm font-medium mb-1">
              Notes
            </label>
            <textarea
              id="j-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? Any observations..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !remedyName.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting && (
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              )}
              Log Entry
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
