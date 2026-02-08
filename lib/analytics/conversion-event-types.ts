/**
 * Conversion Event Types & Constants (Client-Safe)
 *
 * Contains event type constants and type definitions that can be safely
 * imported in both client and server components.
 *
 * For server-only functions that use Prisma, import from
 * '@/lib/analytics/conversion-events' instead.
 */

import type { PlanType } from "@/lib/stripe-config";

/**
 * Conversion event types
 */
export const CONVERSION_EVENT_TYPES = {
  // Upgrade prompts
  UPGRADE_PROMPT_SHOWN: "upgrade_prompt_shown",
  UPGRADE_PROMPT_DISMISSED: "upgrade_prompt_dismissed",
  UPGRADE_PROMPT_CLICKED: "upgrade_prompt_clicked",

  // Feature gates
  FEATURE_GATE_HIT: "feature_gate_hit",
  FEATURE_GATE_UPGRADE_CLICKED: "feature_gate_upgrade_clicked",

  // Limit banners
  LIMIT_WARNING_SHOWN: "limit_warning_shown",
  LIMIT_REACHED: "limit_reached",
  LIMIT_UPGRADE_CLICKED: "limit_upgrade_clicked",

  // Trial events
  TRIAL_ELIGIBLE: "trial_eligible",
  TRIAL_STARTED: "trial_started",
  TRIAL_REMINDER_SENT: "trial_reminder_sent",
  TRIAL_EXPIRED: "trial_expired",
  TRIAL_CONVERTED: "trial_converted",

  // Pricing page
  PRICING_PAGE_VIEWED: "pricing_page_viewed",
  PRICING_PLAN_SELECTED: "pricing_plan_selected",
  PRICING_INTERVAL_TOGGLED: "pricing_interval_toggled",

  // Checkout
  CHECKOUT_STARTED: "checkout_started",
  CHECKOUT_COMPLETED: "checkout_completed",
  CHECKOUT_ABANDONED: "checkout_abandoned",

  // Subscription
  SUBSCRIPTION_CREATED: "subscription_created",
  SUBSCRIPTION_UPGRADED: "subscription_upgraded",
  SUBSCRIPTION_DOWNGRADED: "subscription_downgraded",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  SUBSCRIPTION_REACTIVATED: "subscription_reactivated",
} as const;

export type ConversionEventType =
  (typeof CONVERSION_EVENT_TYPES)[keyof typeof CONVERSION_EVENT_TYPES];

/**
 * Event sources (where the event originated)
 */
export const EVENT_SOURCES = {
  UPGRADE_MODAL: "upgrade_modal",
  FEATURE_GATE: "feature_gate",
  LIMIT_BANNER: "limit_banner",
  PRICING_PAGE: "pricing_page",
  BILLING_PAGE: "billing_page",
  HEADER_CTA: "header_cta",
  TRIAL_BANNER: "trial_banner",
  EMAIL: "email",
  API: "api",
} as const;

export type EventSource = (typeof EVENT_SOURCES)[keyof typeof EVENT_SOURCES];

/**
 * Event metadata structure
 */
export interface ConversionEventMetadata {
  // Feature-specific data
  featureName?: string;
  limitType?: string;
  limitValue?: number;
  currentUsage?: number;
  usagePercentage?: number;

  // UI context
  page?: string;
  component?: string;
  buttonVariant?: string;

  // A/B test data
  experimentId?: string;
  variantId?: string;

  // User context
  userPlan?: PlanType;
  isTrial?: boolean;
  daysInTrial?: number;
  daysAsMember?: number;

  // Additional context
  [key: string]: unknown;
}
