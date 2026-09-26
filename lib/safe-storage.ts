/**
 * localStorage access that never throws (react-best-practices 4.4):
 * getItem/setItem throw in Safari private mode, when storage is disabled,
 * and on quota errors. Reads fall back to null; writes are best-effort.
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable or full; the in-memory state still updates.
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable; nothing to remove.
  }
}
