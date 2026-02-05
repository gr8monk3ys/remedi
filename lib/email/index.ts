/**
 * Email Service
 *
 * Main entry point for email functionality.
 * Provides functions for sending various types of emails with:
 * - Graceful degradation when email is not configured
 * - Error handling and logging
 * - Rate limiting consideration
 */

import { render } from '@react-email/components'
import { getResendClient, getFromEmail, isEmailConfigured } from './client'
import { createLogger } from '@/lib/logger'
import { EMAIL_SUBJECTS, getEmailUrl, EMAIL_URLS } from './config'
import type {
  EmailSendResult,
  WelcomeEmailData,
  SubscriptionConfirmedData,
  SubscriptionCancelledData,
  SubscriptionExpiringData,
  WeeklyDigestData,
  PasswordResetData,
} from './types'

// Import templates
import { WelcomeEmail } from './templates/welcome'
import { SubscriptionConfirmedEmail } from './templates/subscription-confirmed'
import { SubscriptionCancelledEmail } from './templates/subscription-cancelled'
import { SubscriptionExpiringEmail } from './templates/subscription-expiring'
import { WeeklyDigestEmail } from './templates/weekly-digest'
import { PasswordResetEmail } from './templates/password-reset'

const log = createLogger('email-service')

// Re-export types and utilities
export * from './types'
export * from './config'
export { isEmailConfigured } from './client'

/**
 * Internal function to send an email
 * Handles common logic like error handling and logging
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  emailType: string
): Promise<EmailSendResult> {
  // Check if email is configured
  if (!isEmailConfigured()) {
    log.warn('Email not configured, skipping send', { emailType, to })
    return {
      success: false,
      error: 'Email service not configured (RESEND_API_KEY missing)',
    }
  }

  const client = getResendClient()
  if (!client) {
    log.error('Failed to initialize email client', null, { emailType, to })
    return {
      success: false,
      error: 'Failed to initialize email client',
    }
  }

  try {
    log.info('Sending email', { emailType, to })

    const result = await client.emails.send({
      from: getFromEmail(),
      to,
      subject,
      html,
    })

    if (result.error) {
      log.error('Email send failed', result.error, { emailType, to })
      return {
        success: false,
        error: result.error.message,
      }
    }

    log.info('Email sent successfully', {
      emailType,
      to,
      messageId: result.data?.id,
    })

    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (error) {
    log.error('Email send error', error, { emailType, to })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send welcome email to new users
 *
 * @param email - User's email address
 * @param name - User's display name
 * @param userId - Optional user ID for unsubscribe link
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  userId?: string
): Promise<EmailSendResult> {
  const data: WelcomeEmailData = {
    name: name || 'there',
    loginUrl: getEmailUrl(EMAIL_URLS.login),
  }

  const html = await render(WelcomeEmail({ ...data, userId }))

  return sendEmail(email, EMAIL_SUBJECTS.welcome, html, 'welcome')
}

/**
 * Send subscription confirmation email
 *
 * @param email - User's email address
 * @param data - Subscription details
 * @param userId - Optional user ID for unsubscribe link
 */
export async function sendSubscriptionConfirmation(
  email: string,
  data: Omit<SubscriptionConfirmedData, 'manageUrl'>,
  userId?: string
): Promise<EmailSendResult> {
  const fullData: SubscriptionConfirmedData = {
    ...data,
    manageUrl: getEmailUrl(EMAIL_URLS.manageSubscription),
  }

  const html = await render(SubscriptionConfirmedEmail({ ...fullData, userId }))

  return sendEmail(
    email,
    EMAIL_SUBJECTS.subscription_confirmed,
    html,
    'subscription_confirmed'
  )
}

/**
 * Send subscription cancelled email
 *
 * @param email - User's email address
 * @param data - Cancellation details
 * @param userId - Optional user ID for unsubscribe link
 */
export async function sendSubscriptionCancelled(
  email: string,
  data: Omit<SubscriptionCancelledData, 'resubscribeUrl'>,
  userId?: string
): Promise<EmailSendResult> {
  const fullData: SubscriptionCancelledData = {
    ...data,
    resubscribeUrl: getEmailUrl(EMAIL_URLS.manageSubscription),
  }

  const html = await render(SubscriptionCancelledEmail({ ...fullData, userId }))

  return sendEmail(
    email,
    EMAIL_SUBJECTS.subscription_cancelled,
    html,
    'subscription_cancelled'
  )
}

/**
 * Send subscription expiring reminder email
 *
 * @param email - User's email address
 * @param data - Expiration details
 * @param userId - Optional user ID for unsubscribe link
 */
export async function sendExpirationReminder(
  email: string,
  data: Omit<SubscriptionExpiringData, 'renewUrl'>,
  userId?: string
): Promise<EmailSendResult> {
  const fullData: SubscriptionExpiringData = {
    ...data,
    renewUrl: getEmailUrl(EMAIL_URLS.manageSubscription),
  }

  const html = await render(SubscriptionExpiringEmail({ ...fullData, userId }))

  // Customize subject based on urgency
  let subject: string = EMAIL_SUBJECTS.subscription_expiring
  if (data.daysLeft <= 1) {
    subject = 'URGENT: Your Remedi Subscription Expires Tomorrow!'
  } else if (data.daysLeft <= 3) {
    subject = `Your Remedi Subscription Expires in ${data.daysLeft} Days`
  }

  return sendEmail(email, subject, html, 'subscription_expiring')
}

/**
 * Send weekly digest email
 *
 * @param email - User's email address
 * @param data - Digest content
 * @param userId - Optional user ID for unsubscribe link
 */
export async function sendWeeklyDigest(
  email: string,
  data: WeeklyDigestData,
  userId?: string
): Promise<EmailSendResult> {
  const html = await render(WeeklyDigestEmail({ ...data, userId }))

  const subject = `${EMAIL_SUBJECTS.weekly_digest} - ${data.periodStart}`

  return sendEmail(email, subject, html, 'weekly_digest')
}

/**
 * Send password reset email (for future email auth)
 *
 * @param email - User's email address
 * @param data - Reset link details
 */
export async function sendPasswordReset(
  email: string,
  data: PasswordResetData
): Promise<EmailSendResult> {
  const html = await render(PasswordResetEmail(data))

  return sendEmail(email, EMAIL_SUBJECTS.password_reset, html, 'password_reset')
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
  delayMs: number = 100
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (const sendFn of emails) {
    try {
      const result = await sendFn()
      if (result.success) {
        results.sent++
      } else {
        results.failed++
        if (result.error) {
          results.errors.push(result.error)
        }
      }

      // Add delay between emails to avoid rate limiting
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      results.failed++
      results.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  log.info('Batch email complete', {
    sent: results.sent,
    failed: results.failed,
  })

  return results
}
