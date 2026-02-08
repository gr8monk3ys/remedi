/**
 * Tests for lib/db/interactions.ts
 *
 * Tests database operations for drug-supplement interactions:
 * - findInteractionsBySubstance
 * - checkPairInteraction
 * - checkMultipleInteractions
 * - getInteractionsForRemedy
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only module
vi.mock("server-only", () => ({}));

// Mock Prisma client
const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    drugInteraction: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

import {
  findInteractionsBySubstance,
  checkPairInteraction,
  checkMultipleInteractions,
  getInteractionsForRemedy,
} from "@/lib/db/interactions";

// Shared mock data
const mockSevereInteraction = {
  id: "int-1",
  substanceA: "Warfarin",
  substanceAType: "pharmaceutical",
  substanceB: "St. John's Wort",
  substanceBType: "supplement",
  severity: "severe",
  description: "Reduces Warfarin effectiveness",
  mechanism: "CYP3A4 induction",
  recommendation: "Avoid combination",
  evidence: "Strong",
  sources: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockMildInteraction = {
  id: "int-2",
  substanceA: "Aspirin",
  substanceAType: "pharmaceutical",
  substanceB: "Ginger",
  substanceBType: "supplement",
  severity: "mild",
  description: "Possible additive blood-thinning",
  mechanism: "Antiplatelet effect",
  recommendation: "Monitor",
  evidence: "Limited",
  sources: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockContraindicatedInteraction = {
  id: "int-3",
  substanceA: "MAOIs",
  substanceAType: "pharmaceutical",
  substanceB: "St. John's Wort",
  substanceBType: "supplement",
  severity: "contraindicated",
  description: "Risk of serotonin syndrome",
  mechanism: "MAO inhibition",
  recommendation: "Never combine",
  evidence: "Strong",
  sources: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("lib/db/interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findInteractionsBySubstance", () => {
    it("should query for substance in both substanceA and substanceB fields", async () => {
      mockFindMany.mockResolvedValue([mockSevereInteraction]);

      await findInteractionsBySubstance("St. John's Wort");

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              {
                substanceA: {
                  contains: "St. John's Wort",
                  mode: "insensitive",
                },
              },
              {
                substanceB: {
                  contains: "St. John's Wort",
                  mode: "insensitive",
                },
              },
            ],
          },
        }),
      );
    });

    it("should sort results by severity (most severe first)", async () => {
      mockFindMany.mockResolvedValue([
        mockMildInteraction,
        mockContraindicatedInteraction,
        mockSevereInteraction,
      ]);

      const results = await findInteractionsBySubstance("Test");

      expect(results[0].severity).toBe("contraindicated");
      expect(results[1].severity).toBe("severe");
      expect(results[2].severity).toBe("mild");
    });

    it("should return empty array when no interactions found", async () => {
      mockFindMany.mockResolvedValue([]);

      const results = await findInteractionsBySubstance("Water");

      expect(results).toEqual([]);
    });

    it("should handle unknown severity values by putting them last", async () => {
      const unknownSeverity = {
        ...mockMildInteraction,
        id: "int-unknown",
        severity: "unknown_severity",
      };
      mockFindMany.mockResolvedValue([unknownSeverity, mockSevereInteraction]);

      const results = await findInteractionsBySubstance("Test");

      // Severe (rank 1) should come before unknown (rank 99)
      expect(results[0].severity).toBe("severe");
      expect(results[1].severity).toBe("unknown_severity");
    });
  });

  describe("checkPairInteraction", () => {
    it("should check both orderings of the substance pair", async () => {
      mockFindFirst.mockResolvedValue(mockSevereInteraction);

      await checkPairInteraction("Warfarin", "St. John's Wort");

      expect(mockFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              {
                AND: [
                  {
                    substanceA: {
                      contains: "Warfarin",
                      mode: "insensitive",
                    },
                  },
                  {
                    substanceB: {
                      contains: "St. John's Wort",
                      mode: "insensitive",
                    },
                  },
                ],
              },
              {
                AND: [
                  {
                    substanceA: {
                      contains: "St. John's Wort",
                      mode: "insensitive",
                    },
                  },
                  {
                    substanceB: {
                      contains: "Warfarin",
                      mode: "insensitive",
                    },
                  },
                ],
              },
            ],
          },
        }),
      );
    });

    it("should return the interaction when found", async () => {
      mockFindFirst.mockResolvedValue(mockSevereInteraction);

      const result = await checkPairInteraction("Warfarin", "St. John's Wort");

      expect(result).toBeDefined();
      expect(result?.severity).toBe("severe");
      expect(result?.substanceA).toBe("Warfarin");
    });

    it("should return null when no interaction is found", async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await checkPairInteraction("Vitamin C", "Vitamin D");

      expect(result).toBeNull();
    });
  });

  describe("checkMultipleInteractions", () => {
    it("should return empty array when fewer than 2 substances are provided", async () => {
      const result = await checkMultipleInteractions(["OnlyOne"]);

      expect(result).toEqual([]);
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it("should return empty array when empty array is provided", async () => {
      const result = await checkMultipleInteractions([]);

      expect(result).toEqual([]);
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it("should check all pairwise combinations for 2 substances", async () => {
      mockFindMany.mockResolvedValue([mockSevereInteraction]);

      await checkMultipleInteractions(["Warfarin", "St. John's Wort"]);

      // Should generate OR conditions for both orderings of the single pair
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              expect.objectContaining({
                AND: expect.arrayContaining([
                  expect.objectContaining({
                    substanceA: expect.objectContaining({
                      contains: "Warfarin",
                    }),
                  }),
                ]),
              }),
            ]),
          },
        }),
      );
    });

    it("should check all pairwise combinations for 3 substances", async () => {
      mockFindMany.mockResolvedValue([
        mockSevereInteraction,
        mockMildInteraction,
      ]);

      await checkMultipleInteractions([
        "Warfarin",
        "St. John's Wort",
        "Ginger",
      ]);

      // For 3 substances, there are C(3,2)=3 pairs, each checked in both orderings = 6 OR conditions
      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.OR).toHaveLength(6);
    });

    it("should sort results by severity (most severe first)", async () => {
      mockFindMany.mockResolvedValue([
        mockMildInteraction,
        mockContraindicatedInteraction,
        mockSevereInteraction,
      ]);

      const results = await checkMultipleInteractions(["A", "B", "C"]);

      expect(results[0].severity).toBe("contraindicated");
      expect(results[1].severity).toBe("severe");
      expect(results[2].severity).toBe("mild");
    });
  });

  describe("getInteractionsForRemedy", () => {
    it("should delegate to findInteractionsBySubstance", async () => {
      mockFindMany.mockResolvedValue([mockMildInteraction]);

      const results = await getInteractionsForRemedy("Ginger");

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              {
                substanceA: { contains: "Ginger", mode: "insensitive" },
              },
              {
                substanceB: { contains: "Ginger", mode: "insensitive" },
              },
            ],
          },
        }),
      );
      expect(results).toHaveLength(1);
      expect(results[0].substanceB).toBe("Ginger");
    });
  });
});
