/**
 * The AI path answers to the same safety policy as every other write path.
 *
 * It used to answer to none of it: no display floor, no refusal check, and no
 * Replacement Type at all — which rendered as the one result card with no
 * claim-limiting badge. Its prompt still asks the model for "natural remedies
 * as alternatives to pharmaceutical drugs", so the guard has to be in code.
 *
 * These call the real module rather than re-deriving its behaviour, because a
 * test that reimplements the thing it checks cannot fail when that thing
 * regresses.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("@/lib/ai/client", () => ({
  getOpenAIClient: () => ({
    chat: { completions: { create: mockCreate } },
  }),
  openaiCircuitBreaker: { call: (fn: () => unknown) => fn() },
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    naturalRemedy: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "r1",
          name: "Turmeric",
          description: "",
          category: "Herb",
          ingredients: ["curcumin"],
          benefits: ["inflammation"],
          imageUrl: null,
        },
      ]),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

/** An OpenAI completion carrying one recommendation at the given confidence. */
function respondWithConfidence(confidence: number) {
  mockCreate.mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            recommendations: [
              {
                remedyName: "Turmeric",
                confidence,
                reasoning: "because",
              },
            ],
          }),
        },
      },
    ],
  });
}

beforeEach(() => {
  mockCreate.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("a refused substance is refused before the model is called", () => {
  it("refuses when the question names a never-mapped substance", async () => {
    const { enhanceRemedyMatching } = await import("@/lib/ai/matching");

    const outcome = await enhanceRemedyMatching({
      query: "what can I take instead of warfarin",
    });

    expect(outcome.kind).toBe("unknown");
    if (outcome.kind !== "unknown") throw new Error("unreachable");
    expect(outcome.reason).toBe("never-mapped");
    // Not merely filtered afterwards — the model is never asked.
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("refuses when the Medication Cabinet contains one", async () => {
    const { enhanceRemedyMatching } = await import("@/lib/ai/matching");

    const outcome = await enhanceRemedyMatching({
      query: "something for my joints",
      currentMedications: ["Warfarin 5mg", "Ibuprofen"],
    });

    expect(outcome.kind).toBe("unknown");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("does NOT refuse because a symptom happens to name one", async () => {
    // Symptoms describe how someone feels, not what they take. Folding them
    // into identity emptied the whole result set for an unrelated question.
    respondWithConfidence(0.9);
    const { enhanceRemedyMatching } = await import("@/lib/ai/matching");

    const outcome = await enhanceRemedyMatching({
      query: "joint pain",
      symptoms: ["bruising since starting warfarin"],
    });

    expect(outcome.kind).toBe("known");
    expect(mockCreate).toHaveBeenCalled();
  });

  it("answers an ordinary question", async () => {
    respondWithConfidence(0.9);
    const { enhanceRemedyMatching } = await import("@/lib/ai/matching");

    const outcome = await enhanceRemedyMatching({ query: "joint pain" });

    expect(outcome.kind).toBe("known");
    if (outcome.kind !== "known") throw new Error("unreachable");
    expect(outcome.data).toHaveLength(1);
  });
});

describe("a refusal is not an empty result", () => {
  it("distinguishes refusing from the model offering nothing", async () => {
    const { enhanceRemedyMatching } = await import("@/lib/ai/matching");

    const refused = await enhanceRemedyMatching({
      query: "instead of warfarin",
    });

    mockCreate.mockResolvedValue({
      choices: [
        { message: { content: JSON.stringify({ recommendations: [] }) } },
      ],
    });
    const empty = await enhanceRemedyMatching({ query: "joint pain" });

    expect(refused.kind).toBe("unknown");
    expect(empty.kind).toBe("known");
  });
});

describe("AI results carry the same floor and label as every other path", () => {
  it("drops a recommendation below the display floor", async () => {
    // Zod defaults an unparseable confidence to 0.5, so the floor is the only
    // thing standing between a junk response and a rendered Similarity Score.
    respondWithConfidence(0.1);
    const { enhanceRemedyMatching } = await import("@/lib/ai/matching");

    const outcome = await enhanceRemedyMatching({ query: "joint pain" });

    if (outcome.kind !== "known") throw new Error("unreachable");
    expect(outcome.data).toEqual([]);
  });

  it("attaches a Replacement Type the policy decided", async () => {
    respondWithConfidence(0.9);
    const { enhanceRemedyMatching } = await import("@/lib/ai/matching");

    const outcome = await enhanceRemedyMatching({ query: "joint pain" });

    if (outcome.kind !== "known") throw new Error("unreachable");
    expect(outcome.data[0]?.remedy.replacementType).toBe("Alternative");
  });

  it("demotes Alternative for a drug whose class forbids it", async () => {
    respondWithConfidence(0.9);
    const { enhanceRemedyMatching } = await import("@/lib/ai/matching");

    const outcome = await enhanceRemedyMatching({
      query: "alternatives to ciprofloxacin",
    });

    if (outcome.kind !== "known") throw new Error("unreachable");
    expect(outcome.data[0]?.remedy.replacementType).toBe("Complementary");
  });
});
