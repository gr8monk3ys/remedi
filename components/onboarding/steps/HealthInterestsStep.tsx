"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const HEALTH_CATEGORIES = [
  { id: "pain", label: "Pain Relief", icon: "shield" },
  { id: "sleep", label: "Sleep & Relaxation", icon: "moon" },
  { id: "energy", label: "Energy & Focus", icon: "zap" },
  { id: "digestion", label: "Digestive Health", icon: "heart" },
  { id: "immunity", label: "Immune Support", icon: "shield" },
  { id: "mood", label: "Mood & Stress", icon: "smile" },
  { id: "skin", label: "Skin & Hair", icon: "sparkles" },
  { id: "joints", label: "Joint Health", icon: "activity" },
] as const;

const HEALTH_GOALS = [
  { id: "reduce-pharma", label: "Reduce pharmaceutical use" },
  { id: "natural-first", label: "Try natural options first" },
  { id: "complement", label: "Complement existing treatments" },
  { id: "research", label: "Research alternatives" },
  { id: "prevention", label: "Preventive health" },
] as const;

interface HealthInterestsStepProps {
  selectedCategories: string[];
  selectedGoals: string[];
  toggleCategory: (categoryId: string) => void;
  toggleGoal: (goalId: string) => void;
}

export function HealthInterestsStep({
  selectedCategories,
  selectedGoals,
  toggleCategory,
  toggleGoal,
}: HealthInterestsStepProps): React.ReactNode {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Help us personalize your experience. What health areas interest you?
        <span className="text-sm text-muted-foreground ml-1">(Optional)</span>
      </p>

      <div className="space-y-4">
        <h3 className="eyebrow eyebrow-muted">Health Categories</h3>
        <div className="flex flex-wrap gap-2">
          {HEALTH_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                selectedCategories.includes(category.id)
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground hover:border-border-strong hover:bg-muted",
              )}
            >
              {selectedCategories.includes(category.id) && (
                <Check className="w-4 h-4 inline mr-1" />
              )}
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="eyebrow eyebrow-muted">Your Goals</h3>
        <div className="space-y-2">
          {HEALTH_GOALS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-md border px-4 py-2.5 text-left text-sm font-medium transition-colors",
                selectedGoals.includes(goal.id)
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-foreground hover:border-border-strong hover:bg-muted",
              )}
            >
              {goal.label}
              {selectedGoals.includes(goal.id) && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
