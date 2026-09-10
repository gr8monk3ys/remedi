import "server-only";

/**
 * The check standing between the public internet and a scheduled job.
 *
 * Extracted so every cron route uses the same one. It was written once for the
 * weekly digest, and a second job copying it is how the two drift — one of them
 * ends up with an early-return comparison, or forgets that an unset secret must
 * fail closed rather than disabling the check.
 */

/**
 * Constant-time string comparison, so a caller cannot learn the secret by
 * measuring how long a rejection takes.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);

  // Compare lengths without early-return, then fold the length check into the
  // result so mismatched lengths still cost the same work.
  let mismatch = aBytes.length ^ bBytes.length;
  const max = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < max; i++) {
    mismatch |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }

  return mismatch === 0;
}

/** Why a cron request was rejected, or null when it is authorised. */
export type CronRejection = { status: 401 | 503; error: string };

/**
 * Authorise a scheduled request.
 *
 * An unset CRON_SECRET is a 503, not a bypass: a misconfigured deploy must not
 * silently open the endpoint to anyone who finds the path.
 */
export function authorizeCron(request: Request): CronRejection | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return { status: 503, error: "CRON_SECRET is not configured" };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !timingSafeEqual(authHeader, `Bearer ${cronSecret}`)) {
    return { status: 401, error: "Unauthorized" };
  }

  return null;
}
