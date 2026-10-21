/**
 * Integer query parameters.
 *
 * `Math.max(Number("abc"), 1)` is NaN, and a NaN (or a fraction) that reaches
 * Prisma's `skip`/`take` throws, turning a malformed URL into a 500. Every
 * paginated route reads its numbers through here instead.
 */
export function intParam(
  value: string | null | undefined,
  { fallback, min, max }: { fallback: number; min: number; max?: number },
): number {
  const parsed = value == null || value === "" ? NaN : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const whole = Math.trunc(parsed);
  const floored = Math.max(whole, min);
  return max === undefined ? floored : Math.min(floored, max);
}
