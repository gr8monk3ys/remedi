/**
 * Tests for per-user ownership in the database layer.
 *
 * These helpers used to take a bare id and compile to `where: { id }`, which
 * meant ownership was enforced by each route remembering to fetch the row
 * first and compare `userId` by hand. Three routes did that; nothing checked
 * that a fourth would. The scoping is in the helpers now, so these tests
 * assert the owner actually reaches the query.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ownerConditions } from "@/lib/db/owner";

// vi.mock is hoisted, so the stub has to be built inside the factory.
const { prisma } = vi.hoisted(() => {
  const model = () => ({
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue({ id: "x" }),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
  });
  return {
    prisma: {
      remedyReport: model(),
      remedyJournal: model(),
      medicationCabinet: model(),
    },
  };
});

vi.mock("@/lib/db/client", () => ({ prisma }));

import {
  getReportById,
  deleteReport,
  updateReportContent,
} from "@/lib/db/reports";
import {
  getJournalEntryById,
  deleteJournalEntry,
  updateJournalEntry,
} from "@/lib/db/journal";
import {
  getMedicationById,
  removeMedication,
  updateMedication,
} from "@/lib/db/medication-cabinet";

beforeEach(() => {
  for (const m of Object.values(prisma)) {
    for (const fn of Object.values(m)) fn.mockClear();
  }
});

describe("ownerConditions", () => {
  it("returns null when neither identifier is supplied", () => {
    expect(ownerConditions(undefined, undefined)).toBeNull();
    expect(ownerConditions(null, null)).toBeNull();
    expect(ownerConditions("", "")).toBeNull();
  });

  it("includes only the identifiers it was given", () => {
    expect(ownerConditions("u1", undefined)).toEqual([{ userId: "u1" }]);
    expect(ownerConditions(undefined, "s1")).toEqual([{ sessionId: "s1" }]);
    expect(ownerConditions("u1", "s1")).toEqual([
      { sessionId: "s1" },
      { userId: "u1" },
    ]);
  });
});

describe("reads are scoped to the owner", () => {
  it("getReportById filters on userId", async () => {
    await getReportById("r1", "u1");
    expect(prisma.remedyReport.findFirst).toHaveBeenCalledWith({
      where: { id: "r1", userId: "u1" },
    });
  });

  it("getJournalEntryById filters on userId", async () => {
    await getJournalEntryById("j1", "u1");
    expect(prisma.remedyJournal.findFirst).toHaveBeenCalledWith({
      where: { id: "j1", userId: "u1" },
    });
  });

  it("getMedicationById filters on userId", async () => {
    await getMedicationById("m1", "u1");
    expect(prisma.medicationCabinet.findFirst).toHaveBeenCalledWith({
      where: { id: "m1", userId: "u1" },
    });
  });
});

describe("deletes are scoped to the owner", () => {
  it.each([
    ["report", () => deleteReport("r1", "u1"), () => prisma.remedyReport],
    [
      "journal entry",
      () => deleteJournalEntry("j1", "u1"),
      () => prisma.remedyJournal,
    ],
    [
      "medication",
      () => removeMedication("m1", "u1"),
      () => prisma.medicationCabinet,
    ],
  ])("a %s delete carries the owner", async (_label, call, target) => {
    await call();
    expect(target().deleteMany).toHaveBeenCalledWith({
      where: { id: expect.any(String), userId: "u1" },
    });
  });

  it("reports false when nothing was deleted", async () => {
    prisma.remedyJournal.deleteMany.mockResolvedValueOnce({ count: 0 });
    await expect(deleteJournalEntry("j1", "someone-else")).resolves.toBe(false);
  });
});

describe("updates are scoped to the owner", () => {
  it("returns null when the row is not the caller's", async () => {
    prisma.remedyJournal.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      updateJournalEntry("j1", "someone-else", { notes: "x" }),
    ).resolves.toBeNull();
    expect(prisma.remedyJournal.findUnique).not.toHaveBeenCalled();
  });

  it("carries the owner into the update filter", async () => {
    await updateMedication("m1", "u1", { name: "New" });
    expect(prisma.medicationCabinet.updateMany).toHaveBeenCalledWith({
      where: { id: "m1", userId: "u1" },
      data: { name: "New" },
    });
  });

  it("does not write a report belonging to someone else", async () => {
    prisma.remedyReport.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      updateReportContent("r1", "someone-else", { a: 1 }, "complete"),
    ).resolves.toBeNull();
  });
});
