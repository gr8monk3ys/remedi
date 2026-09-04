/**
 * The shape of an answer that might not exist.
 *
 * This codebase keeps rediscovering one distinction: "we looked and there is
 * nothing" is not the same fact as "we cannot tell you". An empty array means
 * both, so anything returning a bare array lets the two collapse — and the
 * collapse always fails in the same direction, presenting a failure as an
 * all-clear.
 *
 * `lib/interactions/read.ts` solved this for Drug Interactions with a
 * discriminated union. This is that union, made generic so the next module to
 * need it does not invent a third copy.
 *
 * The invariant, in every domain that uses it: **`known` is the only arm that
 * proves anything, and `known` with an empty payload is the only state that
 * may be presented to a person as "there are none".** Every `unknown` must be
 * presented as a failure to establish the answer.
 */

/**
 * An answer, or a stated reason there isn't one.
 *
 * `Reason` is a domain's own vocabulary for why an answer is missing — a
 * transport failure, a plan limit, or a deliberate policy refusal. It says
 * what the reader can do about it, never what the answer would have been.
 */
export type Outcome<T, Reason extends string> =
  | { kind: "known"; data: T }
  | { kind: "unknown"; reason: Reason; message: string };

/** Wrap a value as an established answer. */
export function known<T, Reason extends string = never>(
  data: T,
): Outcome<T, Reason> {
  return { kind: "known", data };
}

/** State that no answer is available, and why. */
export function unknown<T, Reason extends string>(
  reason: Reason,
  message: string,
): Outcome<T, Reason> {
  return { kind: "unknown", reason, message };
}

/**
 * The data when the outcome is known, otherwise a caller-supplied fallback.
 *
 * Deliberately not called `unwrap`: reaching for this discards the reason, so
 * it belongs only where the caller has already rendered the `unknown` case and
 * needs a value to fill an otherwise-empty slot. Rendering the fallback *as*
 * the answer is the bug this whole module exists to prevent.
 */
export function dataOr<T, Reason extends string>(
  outcome: Outcome<T, Reason>,
  fallback: T,
): T {
  return outcome.kind === "known" ? outcome.data : fallback;
}
