"use client";

import { useState } from "react";
import { Check, X, Plus, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const HEALTH_CATEGORIES = [
  "Pain Relief",
  "Sleep & Relaxation",
  "Energy & Focus",
  "Digestive Health",
  "Immune Support",
  "Mood & Stress",
  "Skin & Hair",
  "Joint Health",
];

const HEALTH_GOALS = [
  "Reduce pharmaceutical use",
  "Try natural options first",
  "Complement existing treatments",
  "Research alternatives",
  "Preventive health",
];

interface HealthProfileFormProps {
  initialData: {
    categories: string[];
    goals: string[];
    allergies: string[];
    conditions: string[];
    dietaryPrefs: string[];
  };
}

export function HealthProfileForm({
  initialData,
}: HealthProfileFormProps): React.JSX.Element {
  const [categories, setCategories] = useState<string[]>(
    initialData.categories,
  );
  const [goals, setGoals] = useState<string[]>(initialData.goals);
  const [allergies, setAllergies] = useState<string[]>(initialData.allergies);
  const [conditions, setConditions] = useState<string[]>(
    initialData.conditions,
  );
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(
    initialData.dietaryPrefs,
  );
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newPref, setNewPref] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleItem(list: string[], item: string): string[] {
    return list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
  }

  function addToList(
    list: string[],
    setList: (v: string[]) => void,
    value: string,
    setInput: (v: string) => void,
  ): void {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setInput("");
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.put("/api/health-profile", {
        categories,
        goals,
        allergies,
        conditions,
        dietaryPrefs,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Silently fail to match previous behavior
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <h2 className="text-lg font-semibold">Health Interests</h2>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Health Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {HEALTH_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategories(toggleItem(categories, cat))}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                categories.includes(cat)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {categories.includes(cat) && (
                <Check className="w-3 h-3 inline mr-1" />
              )}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Your Goals
        </h3>
        <div className="space-y-2">
          {HEALTH_GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => setGoals(toggleItem(goals, goal))}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                goals.includes(goal)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {goal}
              {goals.includes(goal) && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Allergies</h3>
        <div className="flex flex-wrap gap-2">
          {allergies.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm"
            >
              {a}
              <button
                type="button"
                onClick={() => setAllergies(allergies.filter((i) => i !== a))}
                className="hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addToList(allergies, setAllergies, newAllergy, setNewAllergy);
              }
            }}
            placeholder="Add allergy..."
            className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
          />
          <button
            type="button"
            onClick={() =>
              addToList(allergies, setAllergies, newAllergy, setNewAllergy)
            }
            className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Health Conditions
        </h3>
        <div className="flex flex-wrap gap-2">
          {conditions.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm"
            >
              {c}
              <button
                type="button"
                onClick={() => setConditions(conditions.filter((i) => i !== c))}
                className="hover:text-amber-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addToList(
                  conditions,
                  setConditions,
                  newCondition,
                  setNewCondition,
                );
              }
            }}
            placeholder="Add condition..."
            className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
          />
          <button
            type="button"
            onClick={() =>
              addToList(
                conditions,
                setConditions,
                newCondition,
                setNewCondition,
              )
            }
            className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Dietary Preferences
        </h3>
        <div className="flex flex-wrap gap-2">
          {dietaryPrefs.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm"
            >
              {p}
              <button
                type="button"
                onClick={() =>
                  setDietaryPrefs(dietaryPrefs.filter((i) => i !== p))
                }
                className="hover:text-green-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPref}
            onChange={(e) => setNewPref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addToList(dietaryPrefs, setDietaryPrefs, newPref, setNewPref);
              }
            }}
            placeholder="Add preference (e.g. vegan, gluten-free)..."
            className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
          />
          <button
            type="button"
            onClick={() =>
              addToList(dietaryPrefs, setDietaryPrefs, newPref, setNewPref)
            }
            className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
          ) : null}
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Profile saved!
          </span>
        )}
      </div>
    </div>
  );
}
