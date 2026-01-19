/**
 * Session Management Utility
 *
 * Handles client-side session ID generation and storage for anonymous users.
 * Session IDs are used to track search history, favorites, and preferences
 * without requiring user authentication.
 */

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a session ID for the current user
 * Session ID is stored in localStorage and persists across page reloads
 *
 * @returns Session ID (UUID format)
 */
export function getSessionId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return '';
  }

  const SESSION_KEY = 'remedi_session_id';

  try {
    // Try to get existing session ID
    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      // Generate new session ID
      sessionId = generateUUID();
      localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
  } catch (error) {
    // If localStorage is not available (e.g., private browsing), generate temporary ID
    console.warn('localStorage not available, using temporary session:', error);
    return generateUUID();
  }
}

/**
 * Clear the current session ID
 * Useful for testing or when user wants to start fresh
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const SESSION_KEY = 'remedi_session_id';

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn('Failed to clear session ID:', error);
  }
}

/**
 * Check if session ID exists
 */
export function hasSessionId(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const SESSION_KEY = 'remedi_session_id';

  try {
    return localStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}
