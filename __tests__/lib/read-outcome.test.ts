/**
 * The client half of the Outcome seam.
 *
 * The property under test: no failure reaching `apiClient` can arrive at a
 * caller as data. Every one becomes an `unknown` arm carrying a reason the
 * caller has to render.
 */

import { describe, it, expect } from "vitest";
import { readOutcome } from "@/lib/api/read-outcome";
import { ApiClientError } from "@/lib/api/client";

type Reason = "unauthenticated" | "rate-limited" | "unavailable";

const reasonFor = (code: string): Reason => {
  if (code === "UNAUTHORIZED") return "unauthenticated";
  if (code === "RATE_LIMIT_EXCEEDED") return "rate-limited";
  return "unavailable";
};

const FALLBACK = "We could not establish this.";

describe("readOutcome", () => {
  it("carries a successful read through as known", async () => {
    const outcome = await readOutcome(
      async () => [{ id: "1" }],
      reasonFor,
      FALLBACK,
    );

    expect(outcome).toEqual({ kind: "known", data: [{ id: "1" }] });
  });

  it("keeps a genuinely empty answer as known, not unknown", async () => {
    const outcome = await readOutcome(async () => [], reasonFor, FALLBACK);

    // The whole point: this is the one state that may render as "there are
    // none". It must not be confused with a failure.
    expect(outcome).toEqual({ kind: "known", data: [] });
  });

  it("maps an ApiClientError to the domain's own reason", async () => {
    const outcome = await readOutcome(
      async () => {
        throw new ApiClientError("Sign in first", "UNAUTHORIZED", 401);
      },
      reasonFor,
      FALLBACK,
    );

    expect(outcome).toMatchObject({
      kind: "unknown",
      reason: "unauthenticated",
      message: "Sign in first",
    });
  });

  it("preserves retryAfter so a rate limit can say when to return", async () => {
    const outcome = await readOutcome(
      async () => {
        throw new ApiClientError(
          "Slow down",
          "RATE_LIMIT_EXCEEDED",
          429,
          undefined,
          30,
        );
      },
      reasonFor,
      FALLBACK,
    );

    expect(outcome).toMatchObject({
      kind: "unknown",
      reason: "rate-limited",
      retryAfter: 30,
    });
  });

  it("treats a non-ApiClientError throw as unknown too", async () => {
    const outcome = await readOutcome(
      async () => {
        throw new TypeError("something we did not anticipate");
      },
      reasonFor,
      FALLBACK,
    );

    // A bug in our own parsing tells us nothing about the answer either.
    expect(outcome).toMatchObject({
      kind: "unknown",
      reason: "unavailable",
      message: FALLBACK,
    });
  });

  it("falls back to a message that never claims an absence", async () => {
    const outcome = await readOutcome(
      async () => {
        throw new ApiClientError("", "INTERNAL_ERROR", 500);
      },
      reasonFor,
      FALLBACK,
    );

    expect(outcome).toMatchObject({ kind: "unknown", message: FALLBACK });
  });
});
