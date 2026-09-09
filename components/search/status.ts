/**
 * What a finished search has to say, as one value.
 *
 * A search ends in exactly one of three states, and they are mutually
 * exclusive: it answered, the policy refused to answer, or we could not get
 * an answer. They were previously carried as two independent props — `error`
 * and `refusal` — with the "answered" case implied by both being absent, and
 * the empty state guarded by a hand-written `!refusal && !error`.
 *
 * That guard is a convention, and a convention is exactly what fails here:
 * dropping it renders "No results found." for a drug the policy refused to
 * map, or for an outage. Making the three a union means the empty state is
 * unreachable from the other two arms, checked by the compiler rather than by
 * whoever edits the JSX next.
 *
 * `components/interactions/InteractionResults.tsx` already works this way —
 * it takes an InteractionOutcome and cannot reach its all-clear card from the
 * `unknown` arm. This is search catching up.
 */

import type { SearchRefusal } from "./types";

export type SearchStatus =
  /** The search completed. Results may still be empty — an honest "none". */
  | { kind: "answered" }
  /** The policy will not map this drug. A decision, never an absence. */
  | { kind: "refused"; message: string }
  /** We could not complete the search. Never an absence either. */
  | { kind: "unavailable"; message: string };

/**
 * Collapse the component's separate failure state into one status.
 *
 * Precedence is explicit because it has to be decided somewhere, and a
 * conditional buried in JSX is the wrong somewhere. `unavailable` wins: a
 * thrown request failed outright, so any refusal alongside it would be left
 * over from a previous search rather than a statement about this one.
 *
 * Note what this function cannot express: an answered search that also
 * carries a refusal. The plain search path used to set both — it called
 * `setRefusal(refused)` and then `setResults(remedies)` without returning —
 * and was safe only because the route happens to send an empty list beside a
 * refusal. That was an invariant held by the server and unchecked here.
 */
export function toSearchStatus(state: {
  error: string | null;
  refusal: SearchRefusal | null | undefined;
}): SearchStatus {
  if (state.error) return { kind: "unavailable", message: state.error };
  if (state.refusal) return { kind: "refused", message: state.refusal.message };
  return { kind: "answered" };
}
