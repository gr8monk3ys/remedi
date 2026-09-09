/**
 * The client half of the Outcome seam.
 *
 * `lib/api/response.ts` describes what a route sends; this describes how a
 * caller receives it. Between the two sits `apiClient`, which turns every
 * failure into a thrown `ApiClientError` — and a throw is the one shape that
 * a caller can forget to handle. Forgetting, here, means an outage renders as
 * an all-clear.
 *
 * So nothing in the app should call `apiClient` for a safety-relevant read
 * without going through this: it converts the throw back into an `unknown`
 * arm the caller cannot ignore, because the union will not let them reach the
 * data without saying which case they are in.
 *
 * This generalises the `attempt()` helper that `lib/interactions/read.ts`
 * proved out, so the next domain that needs it does not write a third copy.
 */

import { ApiClientError } from "@/lib/api/client";
import { known, unknown, type Outcome } from "@/lib/outcome";

/**
 * Run a read and convert every failure mode into an `unknown` outcome.
 *
 * @param read the request to attempt
 * @param reasonFor maps an `ErrorCode` from the wire to the domain's own
 *   vocabulary for why an answer is missing
 * @param fallbackMessage shown when the server sent no usable message; it must
 *   say we could not establish the answer, never that there is none
 */
export async function readOutcome<T, Reason extends string>(
  read: () => Promise<T>,
  reasonFor: (code: string) => Reason,
  fallbackMessage: string,
): Promise<Outcome<T, Reason>> {
  try {
    return known(await read());
  } catch (error) {
    if (error instanceof ApiClientError) {
      return unknown(
        reasonFor(error.code),
        error.message || fallbackMessage,
        error.retryAfter,
      );
    }
    // Not an ApiClientError at all — a bug in our own parsing, say. We still
    // know nothing about the answer, so it is still `unknown`.
    return unknown(reasonFor("INTERNAL_ERROR"), fallbackMessage);
  }
}
