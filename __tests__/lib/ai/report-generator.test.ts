/**
 * A report that asked for a Medication Cabinet check has to record whether the
 * check happened. An empty warning list alone cannot tell "none found" from
 * "the check failed", and the viewer must not show the second as the first.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCheckCabinetInteractions = vi.fn();

vi.mock("@/lib/db/client", () => ({ prisma: {} }));
vi.mock("@/lib/db/remedies", () => ({
  searchNaturalRemedies: vi.fn(async () => []),
}));
vi.mock("@/lib/db/medication-cabinet", () => ({
  checkCabinetInteractions: (...args: unknown[]) =>
    mockCheckCabinetInteractions(...args),
}));
vi.mock("@/lib/ai/client", () => ({
  getOpenAIClient: () => null,
  isAIEnabled: () => false,
}));
vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { generateRemedyReport } from "@/lib/ai/report-generator";

const params = {
  reportId: "r1",
  userId: "u1",
  queryType: "condition",
  queryInput: "sleep",
  includeCabinetInteractions: true,
  includeJournalData: false,
};

describe("generateRemedyReport cabinet check", () => {
  beforeEach(() => {
    mockCheckCabinetInteractions.mockReset();
  });

  it("marks the check unavailable when it fails", async () => {
    mockCheckCabinetInteractions.mockRejectedValue(new Error("db down"));

    const report = await generateRemedyReport(params);

    expect(report).toMatchObject({
      interactionCheck: "unavailable",
      interactionWarnings: [],
    });
  });

  it("marks the check done when it succeeds with nothing found", async () => {
    mockCheckCabinetInteractions.mockResolvedValue([]);

    const report = await generateRemedyReport(params);

    expect(report).toMatchObject({
      interactionCheck: "checked",
      interactionWarnings: [],
    });
  });

  it("does not claim a check that was not asked for", async () => {
    const report = await generateRemedyReport({
      ...params,
      includeCabinetInteractions: false,
    });

    expect(report).not.toHaveProperty("interactionCheck", "checked");
    expect(mockCheckCabinetInteractions).not.toHaveBeenCalled();
  });
});
