"use client";

import { useState, useEffect } from "react";
import { getSessionId } from "@/lib/session";

/**
 * Hook for managing session ID for anonymous users
 *
 * Returns the session ID from localStorage (or generates one if not present).
 * Uses the shared session utilities from lib/session.ts.
 *
 * @returns The session ID or null if not yet initialized
 */
export function useSessionId(): string | null {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // getSessionId handles localStorage access and UUID generation
    const id = getSessionId();
    if (id) {
      setSessionId(id);
    }
  }, []);

  return sessionId;
}
