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
        <h3 className="font-medium text-foreground">Health Categories</h3>
        <div className="flex flex-wrap gap-2">
          {HEALTH_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategories.includes(category.id)
                  ? "bg-green-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80",
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
        <h3 className="font-medium text-foreground">Your Goals</h3>
        <div className="space-y-2">
          {HEALTH_GOALS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                selectedGoals.includes(goal.id)
                  ? "bg-green-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80",
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
