/**
 * Unit Tests for AI Matching Module
 *
 * Tests AI client, matching, NLP, and interactions functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { DrugInteractionResult } from "@/lib/ai/types";

// Mock OpenAI before importing
const mockCreate = vi.fn();

vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

// Mock Prisma
// The AI path reads curated forbidden pairs. Unmocked, that read threw and was
// swallowed into known([]) — which is why the "recommendations" test below
// passed while asserting only `length >= 0`.
vi.mock("@/lib/db/interactions", () => ({
  forbiddenRemedyTermsForDrug: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    naturalRemedy: {
      findMany: vi.fn(),
    },
  },
}));

describe("AI Module", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isAIEnabled", () => {
    it("should return true when OPENAI_API_KEY is set", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      const { isAIEnabled } = await import("@/lib/ai/client");
      expect(isAIEnabled()).toBe(true);
    });

    it("should return false when OPENAI_API_KEY is not set", async () => {
      delete process.env.OPENAI_API_KEY;
      const { isAIEnabled } = await import("@/lib/ai/client");
      expect(isAIEnabled()).toBe(false);
    });
  });

  describe("getOpenAIClient", () => {
    it("should return null when API key is not configured", async () => {
      delete process.env.OPENAI_API_KEY;
      vi.resetModules();
      const { getOpenAIClient } = await import("@/lib/ai/client");
      const client = getOpenAIClient();
      expect(client).toBeNull();
    });

    it("should return client when API key is configured", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();
      const { getOpenAIClient } = await import("@/lib/ai/client");
      const client = getOpenAIClient();
      expect(client).not.toBeNull();
    });

    it("should reuse the same client instance", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();
      const { getOpenAIClient } = await import("@/lib/ai/client");
      const client1 = getOpenAIClient();
      const client2 = getOpenAIClient();
      expect(client1).toBe(client2);
    });
  });

  describe("enhanceRemedyMatching", () => {
    it("should return empty array when AI is disabled", async () => {
      delete process.env.OPENAI_API_KEY;
      vi.resetModules();

      const { enhanceRemedyMatching } = await import("@/lib/ai/matching");
      const result = await enhanceRemedyMatching({
        query: "pain relief",
      });

      // No API key configured is not "the model had nothing to suggest".
      expect(result).toMatchObject({ kind: "unknown", reason: "unavailable" });
    });

    it("should return recommendations when AI is enabled", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();

      const { prisma } = await import("@/lib/db");
      vi.mocked(prisma.naturalRemedy.findMany).mockResolvedValue([
        {
          id: "turmeric",
          name: "Turmeric",
          description: "Anti-inflammatory spice",
          category: "Herbal Remedy",
          ingredients: ["curcumin"],
          benefits: ["anti-inflammatory"],
          imageUrl: "https://example.com/turmeric.jpg",
          usage: null,
          dosage: null,
          precautions: null,
          scientificInfo: null,
          references: [],
          relatedRemedies: [],
          sourceUrl: null,
          evidenceLevel: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                recommendations: [
                  {
                    remedyName: "Turmeric",
                    confidence: 0.85,
                    reasoning: "Anti-inflammatory properties",
                    warnings: ["May interact with blood thinners"],
                    interactions: [],
                  },
                ],
              }),
            },
          },
        ],
      });

      const { enhanceRemedyMatching } = await import("@/lib/ai/matching");
      const result = await enhanceRemedyMatching({
        query: "natural pain relief",
      });

      expect(result.kind).toBe("known");
      if (result.kind !== "known") throw new Error("unreachable");
      // `length >= 0` is true of every array, so it asserted nothing.
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.remedy.name).toBe("Turmeric");
    });

    it("should handle AI errors gracefully", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();

      const { prisma } = await import("@/lib/db");
      vi.mocked(prisma.naturalRemedy.findMany).mockResolvedValue([]);

      mockCreate.mockRejectedValue(new Error("API Error"));

      const { enhanceRemedyMatching } = await import("@/lib/ai/matching");
      const result = await enhanceRemedyMatching({
        query: "test",
      });

      // Previously known([]) — an outage rendered as "no remedies found".
      expect(result).toMatchObject({ kind: "unknown", reason: "unavailable" });
    });

    it("should handle empty AI response", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();

      const { prisma } = await import("@/lib/db");
      vi.mocked(prisma.naturalRemedy.findMany).mockResolvedValue([]);

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const { enhanceRemedyMatching } = await import("@/lib/ai/matching");
      const result = await enhanceRemedyMatching({
        query: "test",
      });

      // A model that returned nothing at all did not answer "none" — we never
      // got a response to read.
      expect(result).toMatchObject({ kind: "unknown", reason: "unavailable" });
    });

    it("should handle malformed JSON response", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();

      const { prisma } = await import("@/lib/db");
      vi.mocked(prisma.naturalRemedy.findMany).mockResolvedValue([
        {
          id: "test",
          name: "Test",
          description: "Test",
          category: "Test",
          ingredients: [],
          benefits: [],
          imageUrl: null,
          usage: null,
          dosage: null,
          precautions: null,
          scientificInfo: null,
          references: [],
          relatedRemedies: [],
          sourceUrl: null,
          evidenceLevel: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "not valid json" } }],
      });

      const { enhanceRemedyMatching } = await import("@/lib/ai/matching");
      const result = await enhanceRemedyMatching({
        query: "test",
      });

      expect(result).toEqual({ kind: "known", data: [] });
    });
  });

  describe("processNaturalLanguageQuery", () => {
    it("should return default intent when AI is disabled", async () => {
      delete process.env.OPENAI_API_KEY;
      vi.resetModules();

      const { processNaturalLanguageQuery } = await import("@/lib/ai/nlp");
      const result = await processNaturalLanguageQuery("find pain relief");

      expect(result.intent).toBe("search");
    });

    it("should process query and return intent", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                intent: "search",
                symptomsMentioned: ["headache"],
                concerns: ["natural"],
              }),
            },
          },
        ],
      });

      const { processNaturalLanguageQuery } = await import("@/lib/ai/nlp");
      const result = await processNaturalLanguageQuery(
        "natural remedy for headache",
      );

      expect(result.intent).toBe("search");
      expect(result.symptomsMentioned).toContain("headache");
    });

    it("should handle NLP processing errors", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();

      mockCreate.mockRejectedValue(new Error("NLP Error"));

      const { processNaturalLanguageQuery } = await import("@/lib/ai/nlp");
      const result = await processNaturalLanguageQuery("test query");

      expect(result.intent).toBe("search");
    });

    it("should handle empty response", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const { processNaturalLanguageQuery } = await import("@/lib/ai/nlp");
      const result = await processNaturalLanguageQuery("test");

      expect(result.intent).toBe("search");
    });
  });

  describe("checkDrugInteractions", () => {
    /** Assert the check produced a verdict, and return it. */
    const verdict = <T>(o: { kind: string } & Record<string, unknown>): T => {
      if (o.kind !== "known") {
        throw new Error(`expected a verdict, got: ${String(o.message)}`);
      }
      return o.data as T;
    };

    it("should return safe result for empty medications", async () => {
      vi.resetModules();

      const { checkDrugInteractions } = await import("@/lib/ai/interactions");
      const result = verdict<DrugInteractionResult>(
        await checkDrugInteractions("Turmeric", []),
      );

      expect(result.hasInteractions).toBe(false);
      expect(result.warnings).toEqual([]);
      expect(result.severity).toBe("low");
    });

    it("reports an unavailable checker as unknown, not as an interaction", async () => {
      delete process.env.OPENAI_API_KEY;
      vi.resetModules();

      const { checkDrugInteractions } = await import("@/lib/ai/interactions");
      const outcome = await checkDrugInteractions("Turmeric", ["Warfarin"]);

      // This used to answer with a fabricated `hasInteractions: true` and a
      // moderate severity — safe in direction, but it asserts a verdict that
      // was never reached, in the subsystem where that matters most.
      expect(outcome.kind).toBe("unknown");
      expect(outcome).toMatchObject({ reason: "unavailable" });
      if (outcome.kind !== "unknown") throw new Error("unreachable");
      expect(outcome.message).toMatch(/not a confirmation that none exist/i);
    });

    it("should check interactions when AI is enabled", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                hasInteractions: true,
                warnings: ["Turmeric may enhance effects of blood thinners"],
                severity: "moderate",
                recommendations: ["Monitor bleeding signs", "Consult doctor"],
              }),
            },
          },
        ],
      });

      const { checkDrugInteractions } = await import("@/lib/ai/interactions");
      const result = verdict<DrugInteractionResult>(
        await checkDrugInteractions("Turmeric", ["Warfarin"]),
      );

      expect(result.hasInteractions).toBe(true);
      expect(result.warnings[0]).toContain("blood thinners");
      expect(result.severity).toBe("moderate");
      expect(result.recommendations).toHaveLength(2);
    });

    it("should handle multiple medications", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                hasInteractions: true,
                warnings: ["Multiple potential interactions"],
                severity: "high",
                recommendations: ["Consult healthcare provider before use"],
              }),
            },
          },
        ],
      });

      const { checkDrugInteractions } = await import("@/lib/ai/interactions");
      const result = verdict<DrugInteractionResult>(
        await checkDrugInteractions("Turmeric", [
          "Warfarin",
          "Aspirin",
          "Metformin",
        ]),
      );

      expect(result.hasInteractions).toBe(true);
      expect(result.severity).toBe("high");
    });

    it("should handle interaction check errors", async () => {
      process.env.OPENAI_API_KEY = "sk-test-key";
      vi.resetModules();

      mockCreate.mockRejectedValue(new Error("Interaction check failed"));

      const { checkDrugInteractions } = await import("@/lib/ai/interactions");
      const outcome = await checkDrugInteractions("Turmeric", ["Warfarin"]);

      // A failed check states that it failed. It does not invent a moderate
      // interaction, which is what the old sentinel did.
      expect(outcome).toMatchObject({ kind: "unknown", reason: "unavailable" });
    });
  });
});
