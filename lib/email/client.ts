/**
 * Resend Email Client
 *
 * Provides a lazy-initialized Resend client with graceful degradation
 * when RESEND_API_KEY is not configured.
 */

import { Resend } from "resend";
import { hasResendEmail, getResendApiKey, getEmailFrom } from "@/lib/env";
import { createLogger } from "@/lib/logger";

const log = createLogger("email-client");

// Lazy-initialized Resend client
let resendInstance: Resend | null = null;

/**
 * Check if email functionality is available
 */
export function isEmailConfigured(): boolean {
  return hasResendEmail();
}

/**
 * Get the Resend client (lazy initialization)
 * Returns null if not configured (graceful degradation)
 */
export function getResendClient(): Resend | null {
  if (!isEmailConfigured()) {
    return null;
  }

  if (!resendInstance) {
    const apiKey = getResendApiKey();
    if (!apiKey) {
      return null;
    }
    resendInstance = new Resend(apiKey);
    log.debug("Resend client initialized");
  }

  return resendInstance;
}

/**
 * Get the default from email address
 */
export function getFromEmail(): string {
  return getEmailFrom();
}

/**
 * Reset the client (useful for testing)
 */
export function resetClient(): void {
  resendInstance = null;
}
