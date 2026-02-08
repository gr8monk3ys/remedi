/**
 * Email Service
 *
 * Main entry point for email functionality.
 * Provides functions for sending various types of emails with:
 * - Graceful degradation when email is not configured
 * - EmailPreference checking before sending (respects opt-outs)
 * - EmailLog tracking for every send attempt
 * - Error handling and logging
 * - Rate limiting consideration
 */

import { render } from "@react-email/components";
import { getResendClient, getFromEmail, isEmailConfigured } from "./client";
import { createLogger } from "@/lib/logger";
import { EMAIL_SUBJECTS, getEmailUrl, EMAIL_URLS } from "./config";
import type {
  EmailSendResult,
  EmailType,
  WelcomeEmailData,
  SubscriptionConfirmedData,
  SubscriptionCancelledData,
  SubscriptionExpiringData,
  WeeklyDigestData,
  PasswordResetData,
  ContributionApprovedData,
  ContributionRejectedData,
} from "./types";

// Import templates
import { WelcomeEmail } from "./templates/welcome";
import { SubscriptionConfirmedEmail } from "./templates/subscription-confirmed";
import { SubscriptionCancelledEmail } from "./templates/subscription-cancelled";
import { SubscriptionExpiringEmail } from "./templates/subscription-expiring";
import { WeeklyDigestEmail } from "./templates/weekly-digest";
import { PasswordResetEmail } from "./templates/password-reset";
import { ContributionApprovedEmail } from "./templates/contribution-approved";
import { ContributionRejectedEmail } from "./templates/contribution-rejected";

const log = createLogger("email-service");

// Re-export types and utilities
export * from "./types";
export * from "./config";
export { isEmailConfigured } from "./client";

/**
 * Mapping from EmailType to the EmailPreference field that controls it.
 * Types not listed here are always sent (e.g. welcome, password_reset).
 */
const EMAIL_TYPE_PREFERENCE_MAP: Partial<Record<EmailType, string>> = {
  weekly_digest: "weeklyDigest",
  subscription_confirmed: "subscriptionReminders",
  subscription_cancelled: "subscriptionReminders",
  subscription_expiring: "subscriptionReminders",
  // contribution_approved and contribution_rejected are transactional,
  // so they are always sent (productUpdates could be used, but these are
  // direct responses to user actions and should not be suppressed).
};

/**
 * Lazily import prisma to avoid pulling server-only modules at module
 * evaluation time, which would break client dynamic imports.
 *
 * Returns the prisma client typed loosely since this module only
 * accesses emailPreference and emailLog models internally.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPrisma(): Promise<any> {
  const { prisma } = await import("@/lib/db");
  return prisma;
}

/**
 * Check whether the user has opted out of a given email type.
 * Returns true if the email should be sent, false if opted out.
 * If no preference record exists, the email is sent (defaults apply).
 */
async function shouldSendEmail(
  userId: string | undefined | null,
  emailType: EmailType,
): Promise<boolean> {
  // If there is no user context, send the email (anonymous / system emails)
  if (!userId) return true;

  const preferenceField = EMAIL_TYPE_PREFERENCE_MAP[emailType];
  // If the email type is not governed by a preference, always send
  if (!preferenceField) return true;

  try {
    const prisma = await getPrisma();
    const pref = await prisma.emailPreference.findUnique({
      where: { userId },
      select: { [preferenceField]: true },
    });

    // No preference record means use defaults (which are true for most)
    if (!pref) return true;

    return pref[preferenceField] !== false;
  } catch (error) {
    log.warn("Failed to check email preference, sending email anyway", {
      userId,
      emailType,
      error: error instanceof Error ? error.message : String(error),
    });
    return true;
  }
}

/**
 * Log an email send attempt to the EmailLog table.
 */
async function logEmailSend(params: {
  userId?: string | null;
  email: string;
  emailType: string;
  messageId?: string;
  status: "sent" | "failed";
  errorMsg?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const prisma = await getPrisma();
    await prisma.emailLog.create({
      data: {
        userId: params.userId || null,
        email: params.email,
        emailType: params.emailType,
        messageId: params.messageId || null,
        status: params.status,
        errorMsg: params.errorMsg || null,
        metadata: params.metadata || null,
      },
    });
  } catch (error) {
    // Never let logging failures bubble up and break the email flow
    log.warn("Failed to log email send", {
      emailType: params.emailType,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Internal function to send an email
 * Handles common logic: preference checking, error handling, and logging
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  emailType: EmailType,
  userId?: string | null,
): Promise<EmailSendResult> {
  // Check if email is configured
  if (!isEmailConfigured()) {
    log.warn("Email not configured, skipping send", { emailType, to });
    return {
      success: false,
      error: "Email service not configured (RESEND_API_KEY missing)",
    };
  }

  // Check user preferences before sending
  const allowed = await shouldSendEmail(userId, emailType);
  if (!allowed) {
    log.info("Email suppressed by user preference", { emailType, to, userId });
    return {
      success: false,
      error: "Email suppressed by user preference",
    };
  }

  const client = getResendClient();
  if (!client) {
    log.error("Failed to initialize email client", null, { emailType, to });
    await logEmailSend({
      userId,
      email: to,
      emailType,
      status: "failed",
      errorMsg: "Failed to initialize email client",
    });
    return {
      success: false,
      error: "Failed to initialize email client",
    };
  }

  try {
    log.info("Sending email", { emailType, to });

    const result = await client.emails.send({
      from: getFromEmail(),
      to,
      subject,
      html,
    });

    if (result.error) {
      log.error("Email send failed", result.error, { emailType, to });
      await logEmailSend({
        userId,
        email: to,
        emailType,
        status: "failed",
        errorMsg: result.error.message,
      });
      return {
        success: false,
        error: result.error.message,
      };
    }

    const messageId = result.data?.id;
    log.info("Email sent successfully", {
      emailType,
      to,
      messageId,
    });

    await logEmailSend({
      userId,
      email: to,
      emailType,
      messageId,
      status: "sent",
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    log.error("Email send error", error, { emailType, to });
    await logEmailSend({
      userId,
      email: to,
      emailType,
      status: "failed",
      errorMsg: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send welcome email to new users
 *
 * @param email - User's email address
 * @param name - User's display name
 * @param userId - Optional user ID for unsubscribe link and preference checking
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  userId?: string,
): Promise<EmailSendResult> {
  const data: WelcomeEmailData = {
    name: name || "there",
    loginUrl: getEmailUrl(EMAIL_URLS.login),
  };

  const html = await render(WelcomeEmail({ ...data, userId }));

  return sendEmail(email, EMAIL_SUBJECTS.welcome, html, "welcome", userId);
}

/**
 * Send subscription confirmation email
 *
 * @param email - User's email address
 * @param data - Subscription details
 * @param userId - Optional user ID for unsubscribe link and preference checking
 */
export async function sendSubscriptionConfirmation(
  email: string,
  data: Omit<SubscriptionConfirmedData, "manageUrl">,
  userId?: string,
): Promise<EmailSendResult> {
  const fullData: SubscriptionConfirmedData = {
    ...data,
    manageUrl: getEmailUrl(EMAIL_URLS.manageSubscription),
  };

  const html = await render(
    SubscriptionConfirmedEmail({ ...fullData, userId }),
  );

  return sendEmail(
    email,
    EMAIL_SUBJECTS.subscription_confirmed,
    html,
    "subscription_confirmed",
    userId,
  );
}

/**
 * Send subscription cancelled email
 *
 * @param email - User's email address
 * @param data - Cancellation details
 * @param userId - Optional user ID for unsubscribe link and preference checking
 */
export async function sendSubscriptionCancelled(
  email: string,
  data: Omit<SubscriptionCancelledData, "resubscribeUrl">,
  userId?: string,
): Promise<EmailSendResult> {
  const fullData: SubscriptionCancelledData = {
    ...data,
    resubscribeUrl: getEmailUrl(EMAIL_URLS.manageSubscription),
  };

  const html = await render(
    SubscriptionCancelledEmail({ ...fullData, userId }),
  );

  return sendEmail(
    email,
    EMAIL_SUBJECTS.subscription_cancelled,
    html,
    "subscription_cancelled",
    userId,
  );
}

/**
 * Send subscription expiring reminder email
 *
 * @param email - User's email address
 * @param data - Expiration details
 * @param userId - Optional user ID for unsubscribe link and preference checking
 */
export async function sendExpirationReminder(
  email: string,
  data: Omit<SubscriptionExpiringData, "renewUrl">,
  userId?: string,
): Promise<EmailSendResult> {
  const fullData: SubscriptionExpiringData = {
    ...data,
    renewUrl: getEmailUrl(EMAIL_URLS.manageSubscription),
  };

  const html = await render(SubscriptionExpiringEmail({ ...fullData, userId }));

  // Customize subject based on urgency
  let subject: string = EMAIL_SUBJECTS.subscription_expiring;
  if (data.daysLeft <= 1) {
    subject = "URGENT: Your Remedi Subscription Expires Tomorrow!";
  } else if (data.daysLeft <= 3) {
    subject = `Your Remedi Subscription Expires in ${data.daysLeft} Days`;
  }

  return sendEmail(email, subject, html, "subscription_expiring", userId);
}

/**
 * Send weekly digest email
 *
 * @param email - User's email address
 * @param data - Digest content
 * @param userId - Optional user ID for unsubscribe link and preference checking
 */
export async function sendWeeklyDigest(
  email: string,
  data: WeeklyDigestData,
  userId?: string,
): Promise<EmailSendResult> {
  const html = await render(WeeklyDigestEmail({ ...data, userId }));

  const subject = `${EMAIL_SUBJECTS.weekly_digest} - ${data.periodStart}`;

  return sendEmail(email, subject, html, "weekly_digest", userId);
}

/**
 * Send password reset email (for future email auth)
 *
 * @param email - User's email address
 * @param data - Reset link details
 */
export async function sendPasswordReset(
  email: string,
  data: PasswordResetData,
): Promise<EmailSendResult> {
  const html = await render(PasswordResetEmail(data));

  return sendEmail(
    email,
    EMAIL_SUBJECTS.password_reset,
    html,
    "password_reset",
  );
}

/**
 * Send contribution approved email
 *
 * @param email - User's email address
 * @param data - Approval details including remedy name and URL
 * @param userId - Optional user ID for unsubscribe link and preference checking
 */
export async function sendContributionApproved(
  email: string,
  data: ContributionApprovedData,
  userId?: string,
): Promise<EmailSendResult> {
  const html = await render(ContributionApprovedEmail({ ...data, userId }));

  return sendEmail(
    email,
    EMAIL_SUBJECTS.contribution_approved,
    html,
    "contribution_approved",
    userId,
  );
}

/**
 * Send contribution rejected email
 *
 * @param email - User's email address
 * @param data - Rejection details including moderator note
 * @param userId - Optional user ID for unsubscribe link and preference checking
 */
export async function sendContributionRejected(
  email: string,
  data: Omit<ContributionRejectedData, "contributeUrl">,
  userId?: string,
): Promise<EmailSendResult> {
  const fullData: ContributionRejectedData = {
    ...data,
    contributeUrl: getEmailUrl(EMAIL_URLS.contribute),
  };

  const html = await render(ContributionRejectedEmail({ ...fullData, userId }));

  return sendEmail(
    email,
    EMAIL_SUBJECTS.contribution_rejected,
    html,
    "contribution_rejected",
    userId,
  );
}

/**
 * Send a batch of emails (for cron jobs)
 * Processes emails sequentially to avoid rate limiting
 *
 * @param emails - Array of email sending functions
 * @param delayMs - Delay between emails in milliseconds (default: 100ms)
 */
export async function sendBatchEmails(
  emails: Array<() => Promise<EmailSendResult>>,
  delayMs: number = 100,
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const sendFn of emails) {
    try {
      const result = await sendFn();
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        if (result.error) {
          results.errors.push(result.error);
        }
      }

      // Add delay between emails to avoid rate limiting
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      results.failed++;
      results.errors.push(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  log.info("Batch email complete", {
    sent: results.sent,
    failed: results.failed,
  });

  return results;
}

// ============================================================================
// Weekly Digest Cron Job Placeholder
// ============================================================================
//
// To send weekly digests, create a cron route at:
//   app/api/cron/weekly-digest/route.ts
//
// The cron job should:
// 1. Query all users with emailPreferences.weeklyDigest === true
// 2. For each user, gather:
//    - New remedies added in the past 7 days
//    - User's search count and saved remedies count
//    - Top trending searches across the platform
// 3. Call sendWeeklyDigest() for each user via sendBatchEmails()
// 4. Protect the route with a CRON_SECRET header check
//
// Recommended trigger: Vercel Cron or external scheduler hitting the endpoint
// weekly (e.g., every Monday at 9:00 AM UTC).
//
// Example Vercel cron config in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/weekly-digest",
//     "schedule": "0 9 * * 1"
//   }]
// }
// ============================================================================
