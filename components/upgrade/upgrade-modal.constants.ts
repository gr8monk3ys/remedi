/**
 * Static data for the UpgradeModal component.
 */

export interface PlanComparisonRow {
  feature: string;
  free: string;
  basic: string;
  premium: string;
  icon: string;
}

export interface TriggerMessage {
  title: string;
  description: string;
}

export const PLAN_COMPARISON: PlanComparisonRow[] = [
  {
    feature: "Daily searches",
    free: "5",
    basic: "100",
    premium: "Unlimited",
    icon: "searches",
  },
  {
    feature: "Saved favorites",
    free: "3",
    basic: "50",
    premium: "Unlimited",
    icon: "favorites",
  },
  {
    feature: "AI-powered searches",
    free: "-",
    basic: "10/day",
    premium: "50/day",
    icon: "aiSearches",
  },
  {
    feature: "Compare remedies",
    free: "-",
    basic: "Up to 4",
    premium: "Up to 10",
    icon: "compare",
  },
  {
    feature: "Search history",
    free: "-",
    basic: "Full access",
    premium: "Full access",
    icon: "history",
  },
  {
    feature: "Export data",
    free: "-",
    basic: "Yes",
    premium: "Yes",
    icon: "export",
  },
];

export const TRIGGER_MESSAGES: Record<string, TriggerMessage> = {
  search_limit: {
    title: "You've reached your daily search limit",
    description: "Upgrade to get more searches and unlock powerful features.",
  },
  ai_search_limit: {
    title: "AI search limit reached",
    description:
      "Get more AI-powered searches to find the perfect natural remedies.",
  },
  favorite_limit: {
    title: "You've saved the maximum favorites",
    description:
      "Upgrade to save unlimited favorites and organize your remedies.",
  },
  compare_limit: {
    title: "Compare more remedies",
    description: "Upgrade to compare more remedies side by side.",
  },
  export: {
    title: "Export is a premium feature",
    description: "Upgrade to export your data and favorites.",
  },
  history: {
    title: "Search history is a premium feature",
    description: "Upgrade to access your complete search history.",
  },
  feature: {
    title: "Unlock this feature",
    description: "Upgrade your plan to access premium features.",
  },
};
