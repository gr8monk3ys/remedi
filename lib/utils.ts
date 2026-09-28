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

// Display formatters (web interface guidelines: Intl, not hardcoded formats).
// Built once per module; pinned to en-US so the server render and hydration
// produce the same string.
const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const fixedFormatters = new Map<number, Intl.NumberFormat>();
const dateFormatters = {
  /** 1/5/2026 */
  numeric: new Intl.DateTimeFormat("en-US"),
  /** Jan 5, 2026 */
  medium: new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  /** January 5, 2026 */
  long: new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
  /** Jan 5, 2026, 3:04 PM */
  mediumWithTime: new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }),
  /** 3:04:05 PM */
  time: new Intl.DateTimeFormat("en-US", { timeStyle: "medium" }),
} as const;

export function formatPrice(amount: number): string {
  return usdFormatter.format(amount);
}

/** Grouped number; `fractionDigits` fixes the decimals like toFixed(). */
export function formatNumber(value: number, fractionDigits?: number): string {
  if (fractionDigits === undefined) return integerFormatter.format(value);
  let formatter = fixedFormatters.get(fractionDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    fixedFormatters.set(fractionDigits, formatter);
  }
  return formatter.format(value);
}

export function formatDate(
  value: Date | string | number,
  style: keyof typeof dateFormatters = "numeric",
): string {
  return dateFormatters[style].format(
    value instanceof Date ? value : new Date(value),
  );
}
