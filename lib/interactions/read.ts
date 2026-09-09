/**
 * Drug Interaction reads, client-side.
 *
 * Every interaction read in the app goes through this module. It exists to
 * make one distinction impossible to lose: "we checked and found nothing" is
 * not the same fact as "we could not check". An empty array can mean either,
 * so callers never receive a bare array — they receive an InteractionOutcome
 * and have to say which case they are rendering.
 */

import { apiClient } from "@/lib/api/client";
import { readOutcome } from "@/lib/api/read-outcome";
import type { Outcome } from "@/lib/outcome";
import type {
  CheckResponse,
  Interaction,
} from "@/components/interactions/interaction.types";

/** Why an interaction read could not produce an answer. */
export type UnknownReason =
  /** Not signed in. */
  | "unauthenticated"
  /** Signed in, but the plan does not include this check. */
  | "plan-required"
  /** Too many requests. */
  | "rate-limited"
  /** Anything else: server error, network failure, unparseable body. */
  | "unavailable";

/**
 * The result of an interaction read.
 *
 * `known` is the only arm that proves anything about interactions. In
 * particular, `known` with an empty payload is the only state that may be
 * presented as "no known interactions"; every `unknown` must be presented as
 * a failure to verify.
 *
 * This is the shared `Outcome` at a specific Reason, not a second copy of it.
 * It used to be written out longhand here, which is how the codebase came to
 * hold two structurally identical definitions of the same distinction.
 */
export type InteractionOutcome<T> = Outcome<T, UnknownReason>;

const FALLBACK_MESSAGE =
  "We could not check for interactions right now. This is not a confirmation that none exist.";

function reasonForCode(code: string): UnknownReason {
  switch (code) {
    case "UNAUTHORIZED":
      return "unauthenticated";
    case "FORBIDDEN":
    case "LIMIT_EXCEEDED":
      return "plan-required";
    case "RATE_LIMIT_EXCEEDED":
      return "rate-limited";
    default:
      return "unavailable";
  }
}

/**
 * Run a read and convert every failure mode into an `unknown` outcome.
 *
 * This is the only place an interaction read turns a thrown ApiClientError
 * into a result, which is why no call site needs a try/catch of its own — and
 * why an omitted one cannot silently become an all-clear. The conversion
 * itself now lives in `readOutcome`, shared with every other domain that has
 * to make the same guarantee.
 */
function attempt<T>(read: () => Promise<T>): Promise<InteractionOutcome<T>> {
  return readOutcome(read, reasonForCode, FALLBACK_MESSAGE);
}

/** Interactions recorded for a single substance. */
export function readInteractionsFor(
  substance: string,
): Promise<InteractionOutcome<Interaction[]>> {
  return attempt(() =>
    apiClient.get<Interaction[]>(
      `/api/interactions?substance=${encodeURIComponent(substance)}`,
    ),
  );
}

/** Interactions between every pair in a list of substances. */
export function checkInteractionsBetween(
  substances: string[],
): Promise<InteractionOutcome<CheckResponse>> {
  return attempt(() =>
    apiClient.post<CheckResponse>("/api/interactions/check", { substances }),
  );
}

/** Interactions between the signed-in user's active cabinet medications. */
export function readCabinetInteractions(): Promise<
  InteractionOutcome<Interaction[]>
> {
  return attempt(async () => {
    const data = await apiClient.get<{ interactions: Interaction[] }>(
      "/api/medication-cabinet/interactions",
    );
    return data.interactions;
  });
}
