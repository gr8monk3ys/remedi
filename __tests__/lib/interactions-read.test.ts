/**
 * Tests for the Drug Interaction read module.
 *
 * The property under test: no failure mode may produce a `known` outcome.
 * `known` is the only arm a caller may render as "no known interactions", so
 * anything that reaches it without a successful response is a safety defect.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  readInteractionsFor,
  checkInteractionsBetween,
  readCabinetInteractions,
} from "@/lib/interactions/read";

function respondWith(body: unknown, contentType = "application/json") {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": contentType }),
    json: async () => body,
  } as unknown as Response);
}

function respondWithError(
  code: string,
  message = "failed",
  extra: Record<string, unknown> = {},
) {
  respondWith({
    success: false,
    error: { code, message, statusCode: 500, ...extra },
  });
}

const INTERACTION = {
  id: "1",
  substanceA: "St. John's Wort",
  substanceAType: "natural_remedy",
  substanceB: "Warfarin",
  substanceBType: "pharmaceutical",
  severity: "severe",
  description: "Reduces anticoagulant effect.",
  mechanism: null,
  recommendation: null,
  evidence: "established",
  sources: [],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("readInteractionsFor", () => {
  it("returns known on a successful response", async () => {
    respondWith({ success: true, data: [INTERACTION] });

    const outcome = await readInteractionsFor("St. John's Wort");

    expect(outcome).toEqual({ kind: "known", data: [INTERACTION] });
  });

  it("returns known with an empty array when nothing was found", async () => {
    respondWith({ success: true, data: [] });

    const outcome = await readInteractionsFor("Chamomile");

    // The one case a caller may present as an all-clear.
    expect(outcome).toEqual({ kind: "known", data: [] });
  });

  it.each([
    ["UNAUTHORIZED", "unauthenticated"],
    ["FORBIDDEN", "plan-required"],
    ["LIMIT_EXCEEDED", "plan-required"],
    ["RATE_LIMIT_EXCEEDED", "rate-limited"],
    ["DATABASE_ERROR", "unavailable"],
    ["INTERNAL_ERROR", "unavailable"],
    ["INVALID_INPUT", "unavailable"],
    ["SOMETHING_WE_HAVE_NEVER_SEEN", "unavailable"],
  ])("maps %s to reason %s", async (code, reason) => {
    respondWithError(code);

    const outcome = await readInteractionsFor("Warfarin");

    expect(outcome.kind).toBe("unknown");
    if (outcome.kind === "unknown") {
      expect(outcome.reason).toBe(reason);
    }
  });

  it("carries retryAfter through on a rate limit", async () => {
    respondWithError("RATE_LIMIT_EXCEEDED", "Too many requests", {
      retryAfter: 42,
    });

    const outcome = await readInteractionsFor("Warfarin");

    expect(outcome).toMatchObject({
      kind: "unknown",
      reason: "rate-limited",
      retryAfter: 42,
    });
  });

  it("returns unknown when the response is not JSON", async () => {
    respondWith("<html>502 Bad Gateway</html>", "text/html");

    const outcome = await readInteractionsFor("Warfarin");

    expect(outcome.kind).toBe("unknown");
  });

  it("returns unknown when the body cannot be parsed", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => {
        throw new Error("invalid json");
      },
    } as unknown as Response);

    const outcome = await readInteractionsFor("Warfarin");

    expect(outcome.kind).toBe("unknown");
  });

  it("returns unknown when the request rejects", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const outcome = await readInteractionsFor("Warfarin");

    expect(outcome).toMatchObject({ kind: "unknown", reason: "unavailable" });
  });
});

describe("checkInteractionsBetween", () => {
  it("keeps the summary counts the checker renders", async () => {
    const payload = {
      interactions: [INTERACTION],
      substancesChecked: ["St. John's Wort", "Warfarin"],
      pairsChecked: 1,
      interactionsFound: 1,
    };
    respondWith({ success: true, data: payload });

    const outcome = await checkInteractionsBetween([
      "St. John's Wort",
      "Warfarin",
    ]);

    expect(outcome).toEqual({ kind: "known", data: payload });
  });

  it("returns unknown on failure", async () => {
    respondWithError("DATABASE_ERROR");

    const outcome = await checkInteractionsBetween(["a", "b"]);

    expect(outcome.kind).toBe("unknown");
  });
});

describe("readCabinetInteractions", () => {
  it("unwraps the endpoint envelope to a bare list", async () => {
    respondWith({
      success: true,
      data: { interactions: [INTERACTION], count: 1 },
    });

    const outcome = await readCabinetInteractions();

    expect(outcome).toEqual({ kind: "known", data: [INTERACTION] });
  });

  it("reports the plan gate as plan-required, not as an empty cabinet", async () => {
    respondWithError(
      "FORBIDDEN",
      "Cabinet interaction checking requires a Basic plan or higher",
    );

    const outcome = await readCabinetInteractions();

    expect(outcome).toMatchObject({
      kind: "unknown",
      reason: "plan-required",
    });
  });
});
