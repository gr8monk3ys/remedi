/**
 * The search display states, as one union.
 *
 * The property under test: nothing a search can produce, other than an
 * answered search, is allowed to reach the screen as "No results found".
 */

import { describe, it, expect } from "vitest";
import { toSearchStatus } from "@/components/search/status";

describe("toSearchStatus", () => {
  it("reports an answered search when nothing went wrong", () => {
    expect(toSearchStatus({ error: null, refusal: null })).toEqual({
      kind: "answered",
    });
  });

  it("carries a policy refusal as its own arm, not as an absence", () => {
    const status = toSearchStatus({
      error: null,
      refusal: {
        reason: "never-mapped",
        message: "Warfarin is an anticoagulant.",
      },
    });

    expect(status).toEqual({
      kind: "refused",
      message: "Warfarin is an anticoagulant.",
    });
    // The empty state lives behind `answered`, so a refusal cannot reach it.
    expect(status.kind).not.toBe("answered");
  });

  it("carries a failure as its own arm, not as an absence", () => {
    const status = toSearchStatus({
      error: "We could not complete your search.",
      refusal: null,
    });

    expect(status).toEqual({
      kind: "unavailable",
      message: "We could not complete your search.",
    });
    expect(status.kind).not.toBe("answered");
  });

  it("prefers the failure when a stale refusal is still in state", () => {
    // A thrown request failed outright, so a refusal beside it describes some
    // earlier search rather than this one.
    const status = toSearchStatus({
      error: "Network unavailable",
      refusal: { reason: "never-mapped", message: "stale" },
    });

    expect(status).toEqual({
      kind: "unavailable",
      message: "Network unavailable",
    });
  });

  it("treats an undefined refusal the same as an absent one", () => {
    expect(toSearchStatus({ error: null, refusal: undefined })).toEqual({
      kind: "answered",
    });
  });

  it("never reports answered when either failure is present", () => {
    const cases = [
      { error: "boom", refusal: null },
      { error: null, refusal: { reason: "never-mapped", message: "no" } },
      { error: "boom", refusal: { reason: "never-mapped", message: "no" } },
    ];

    for (const state of cases) {
      expect(toSearchStatus(state).kind).not.toBe("answered");
    }
  });
});
