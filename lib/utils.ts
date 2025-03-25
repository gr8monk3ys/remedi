import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns true if the value is shaped like a UUID (8-4-4-4-12 hex).
 *
 * Database IDs use the Postgres `uuid` type, which rejects non-UUID input at
 * the query level (e.g. mock IDs like "101" or "mock-remedy-3"). Guard with
 * this before querying by ID so non-UUID values fall through to mock data
 * instead of throwing an invalid-input error. The pattern is intentionally
 * lenient (it does not enforce version/variant nibbles) so it accepts any
 * value Postgres would, avoiding false negatives on stored IDs.
 */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
