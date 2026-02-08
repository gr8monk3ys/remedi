/**
 * Email Configuration
 *
 * Configuration settings for email functionality.
 */

/**
 * Email rate limiting configuration
 * Prevents sending too many emails to the same address
 */
export const EMAIL_RATE_LIMITS = {
  /** Maximum emails per hour to a single address */
  perHour: 10,
  /** Maximum emails per day to a single address */
  perDay: 50,
  /** Time window for rate limiting in milliseconds */
  windowMs: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * Brand configuration for email templates
 */
export const EMAIL_BRAND = {
  name: "Remedi",
  tagline: "Natural Alternatives to Pharmaceuticals",
  logoUrl: "https://remedi.com/logo.png",
  primaryColor: "#10B981", // Emerald green
  secondaryColor: "#059669",
  textColor: "#1F2937",
  backgroundColor: "#F9FAFB",
  footerColor: "#6B7280",
} as const;

/**
 * Email URLs (relative to base URL)
 */
export const EMAIL_URLS = {
  home: "/",
  login: "/sign-in",
  unsubscribe: "/settings/email-preferences",
  manageSubscription: "/settings/subscription",
  privacyPolicy: "/privacy",
  termsOfService: "/terms",
  contact: "/contact",
  support: "/support",
} as const;

/**
 * Get full URL from relative path
 */
export function getEmailUrl(path: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? "https://" + process.env.VERCEL_URL
      : "http://localhost:3000");
  return `${baseUrl}${path}`;
}

/**
 * Get unsubscribe URL with token
 */
export function getUnsubscribeUrl(userId: string, emailType?: string): string {
  const baseUrl = getEmailUrl(EMAIL_URLS.unsubscribe);
  const params = new URLSearchParams({ userId });
  if (emailType) {
    params.append("type", emailType);
  }
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Email subjects for each email type
 */
export const EMAIL_SUBJECTS = {
  welcome: "Welcome to Remedi - Your Natural Health Journey Starts Here",
  subscription_confirmed: "Your Remedi Subscription is Active",
  subscription_cancelled: "Your Remedi Subscription Has Been Cancelled",
  subscription_expiring: "Your Remedi Subscription Expires Soon",
  weekly_digest: "Your Weekly Remedi Digest",
  password_reset: "Reset Your Remedi Password",
} as const;
