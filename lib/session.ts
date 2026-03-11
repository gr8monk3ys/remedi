/**
 * Session Management Utility
 *
 * Handles client-side session ID generation and storage for anonymous users.
 * Session IDs are used to track search history, favorites, and preferences
 * without requiring user authentication.
 */

import { createLogger } from "@/lib/logger";

const logger = createLogger("session");
const SESSION_KEY = "remedi_session_id";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  if (typeof globalThis.crypto === "undefined") {
    throw new Error("Secure crypto API is unavailable");
  }

  if (globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);

  // Force RFC 4122 v4 UUID version and variant bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Get or create a session ID for the current user
 * Session ID is stored in localStorage and persists across page reloads
 *
 * @returns Session ID (UUID format)
 */
export function getSessionId(): string {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return "";
  }

  try {
    // Try to get existing session ID
    const existingSessionId = localStorage.getItem(SESSION_KEY);

    if (existingSessionId) {
      return existingSessionId;
    }
  } catch (error) {
    logger.warn("Failed to read session ID from localStorage", {
      error,
    });
  }

  let sessionId: string;
  try {
    sessionId = generateUUID();
  } catch (error) {
    logger.error("Failed to generate secure session ID", error);
    return "";
  }

  try {
    localStorage.setItem(SESSION_KEY, sessionId);
  } catch (error) {
    logger.warn("Failed to persist session ID to localStorage", {
      error,
    });
  }

  return sessionId;
}

/**
 * Clear the current session ID
 * Useful for testing or when user wants to start fresh
 */
export function clearSessionId(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    logger.warn("Failed to clear session ID", { error });
  }
}

/**
 * Check if session ID exists
 */
export function hasSessionId(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return localStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}
