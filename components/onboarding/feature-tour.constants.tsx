import { Search, Sparkles, SlidersHorizontal, Heart, Moon } from "lucide-react";

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right";
  icon: React.ReactNode;
  highlight?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "search",
    title: "Smart Search",
    description:
      "Enter any pharmaceutical or supplement name to find natural alternatives. Try 'ibuprofen' or 'vitamin D' to get started.",
    targetSelector: "[data-search-input]",
    position: "bottom",
    icon: <Search className="w-5 h-5" />,
    highlight: true,
  },
  {
    id: "ai-toggle",
    title: "AI-Powered Search",
    description:
      "Toggle on AI search for smarter results. You can describe symptoms in natural language like 'I have trouble sleeping' or 'need help with joint pain'.",
    targetSelector: "[data-ai-toggle]",
    position: "bottom",
    icon: <Sparkles className="w-5 h-5" />,
    highlight: true,
  },
  {
    id: "filters",
    title: "Filter Results",
    description:
      "Use filters to narrow down results by category or nutrient type. Find exactly what you're looking for faster.",
    targetSelector: "[data-filter-toggle]",
    position: "bottom",
    icon: <SlidersHorizontal className="w-5 h-5" />,
    highlight: true,
  },
  {
    id: "favorites",
    title: "Save Your Favorites",
    description:
      "Click the heart icon on any remedy to save it to your collection. Access your favorites anytime, from any device.",
    targetSelector: "[data-favorite-button]",
    position: "left",
    icon: <Heart className="w-5 h-5" />,
    highlight: true,
  },
  {
    id: "dark-mode",
    title: "Dark Mode",
    description:
      "Toggle between light and dark mode for comfortable viewing. Your preference is saved automatically.",
    targetSelector: "[data-theme-toggle]",
    position: "bottom",
    icon: <Moon className="w-5 h-5" />,
    highlight: true,
  },
];
