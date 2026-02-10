/**
 * References Input Component
 *
 * Manages a list of references with title and optional URL.
 */

import { Plus, X } from "lucide-react";
import type { Reference } from "./types";

interface ReferencesInputProps {
  references: Reference[];
  onReferenceChange: (
    index: number,
    field: keyof Reference,
    value: string,
  ) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function ReferencesInput({
  references,
  onReferenceChange,
  onAdd,
  onRemove,
}: ReferencesInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        References & Sources
      </label>
      {references.map((ref, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={ref.title}
            onChange={(e) => onReferenceChange(index, "title", e.target.value)}
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Reference title"
          />
          <input
            type="url"
            value={ref.url || ""}
            onChange={(e) => onReferenceChange(index, "url", e.target.value)}
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="URL (optional)"
          />
          {references.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              aria-label={`Remove reference ${index + 1}`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <Plus className="w-4 h-4" /> Add Reference
      </button>
    </div>
  );
}
