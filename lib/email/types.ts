/**
 * Email Types
 *
 * Type definitions for email functionality.
 */

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Base email options
 */
export interface EmailOptions {
  to: string;
  subject: string;
  replyTo?: string;
}

/**
 * Welcome email data
 */
export interface WelcomeEmailData {
  name: string;
  loginUrl?: string;
}

/**
 * Subscription confirmed email data
 */
export interface SubscriptionConfirmedData {
  name: string;
  plan: string;
  interval: "monthly" | "yearly";
  price: string;
  nextBillingDate: string;
  manageUrl: string;
}

/**
 * Subscription cancelled email data
 */
export interface SubscriptionCancelledData {
  name: string;
  plan: string;
  accessUntil: string;
  resubscribeUrl: string;
}

/**
 * Subscription expiring email data
 */
export interface SubscriptionExpiringData {
  name: string;
  plan: string;
  daysLeft: number;
  expirationDate: string;
  renewUrl: string;
}

/**
 * Weekly digest email data
 */
export interface WeeklyDigestData {
  name: string;
  newRemedies: Array<{
    name: string;
    category: string;
    url: string;
  }>;
  topSearches: Array<{
    query: string;
    count: number;
  }>;
  savedRemedies: number;
  searchCount: number;
  periodStart: string;
  periodEnd: string;
  personalizedRemedies?: Array<{
    name: string;
    category: string;
    matchReason: string;
    url: string;
  }>;
  interactionAlerts?: Array<{
    medication: string;
    substance: string;
    severity: string;
    description: string;
  }>;
  journalSummary?: {
    entriesThisWeek: number;
    avgRating: number;
    topRemedy: string | null;
  };
  aiInsight?: string;
}

/**
 * Password reset email data
 */
export interface PasswordResetData {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

/**
 * Contribution approved email data
 */
export interface ContributionApprovedData {
  name: string;
  remedyName: string;
  remedyUrl: string;
}

/**
 * Contribution rejected email data
 */
export interface ContributionRejectedData {
  name: string;
  remedyName: string;
  moderatorNote?: string;
  contributeUrl: string;
}

/**
 * Email type identifiers for tracking and preferences
 */
export type EmailType =
  | "welcome"
  | "subscription_confirmed"
  | "subscription_cancelled"
  | "subscription_expiring"
  | "weekly_digest"
  | "password_reset"
  | "contribution_approved"
  | "contribution_rejected";

/**
 * Email preference settings
 */
export interface EmailPreferences {
  weeklyDigest: boolean;
  marketingEmails: boolean;
  productUpdates: boolean;
  subscriptionReminders: boolean;
}

/**
 * Default email preferences for new users
 */
export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  weeklyDigest: true,
  marketingEmails: false,
  productUpdates: true,
  subscriptionReminders: true,
};
