"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface MedicationFormProps {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

export function MedicationForm({
  onSubmit,
  onClose,
}: MedicationFormProps): React.JSX.Element {
  const [name, setName] = useState("");
  const [type, setType] = useState("pharmaceutical");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        dosage: dosage || null,
        frequency: frequency || null,
        notes: notes || null,
      });
    } catch {
      setError("Failed to add medication");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl border shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Medication</h3>
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
            <label
              htmlFor="med-name"
              className="block text-sm font-medium mb-1"
            >
              Name *
            </label>
            <input
              id="med-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ibuprofen, Vitamin D, Turmeric"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="med-type"
              className="block text-sm font-medium mb-1"
            >
              Type
            </label>
            <select
              id="med-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="pharmaceutical">Pharmaceutical</option>
              <option value="supplement">Supplement</option>
              <option value="natural_remedy">Natural Remedy</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="med-dosage"
              className="block text-sm font-medium mb-1"
            >
              Dosage
            </label>
            <input
              id="med-dosage"
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 200mg, 1 capsule"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="med-frequency"
              className="block text-sm font-medium mb-1"
            >
              Frequency
            </label>
            <select
              id="med-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="">Select frequency</option>
              <option value="daily">Daily</option>
              <option value="twice_daily">Twice daily</option>
              <option value="as_needed">As needed</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="med-notes"
              className="block text-sm font-medium mb-1"
            >
              Notes
            </label>
            <textarea
              id="med-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              ) : null}
              Add
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
