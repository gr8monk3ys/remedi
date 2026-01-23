/**
 * Dynamic List Input Component
 *
 * Reusable component for managing lists of inputs (ingredients, benefits, etc.)
 */

import { Plus, X } from "lucide-react";

interface DynamicListInputProps {
  label: string;
  items: string[];
  placeholder?: string;
  onItemChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  addLabel?: string;
  required?: boolean;
}

export function DynamicListInput({
  label,
  items,
  placeholder,
  onItemChange,
  onAdd,
  onRemove,
  addLabel = "Add Item",
  required = false,
}: DynamicListInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && "*"}
      </label>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={item}
            onChange={(e) => onItemChange(index, e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={placeholder}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
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
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}
