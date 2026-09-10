/**
 * startTrial's guards, against the real function.
 *
 * `startTrial` upserts plan and status unconditionally, so whatever stops it
 * running has to live in front of that write. Two things do: trial eligibility,
 * and an existing paid subscription.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUserFindUnique = vi.fn();
const mockSubscriptionFindUnique = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: (...a: unknown[]) => mockUserFindUnique(...a) },
    subscription: {
      findUnique: (...a: unknown[]) => mockSubscriptionFindUnique(...a),
    },
    $transaction: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("startTrial", () => {
  it("refuses a user who already holds an active subscription", async () => {
    // Without this guard a paying Basic subscriber could call
    // /api/trial/start, be moved to Premium on a trial, and later be reset to
    // "free" by processExpiredTrials — cancelling a paying customer.
    mockUserFindUnique.mockResolvedValue({ hasUsedTrial: false });
    mockSubscriptionFindUnique.mockResolvedValue({ status: "active" });

    const { startTrial } = await import("@/lib/trial");

    await expect(startTrial("user-1")).rejects.toThrow(
      /already has an active subscription/i,
    );
  });

  it("refuses a user mid-trial rather than extending it", async () => {
    mockUserFindUnique.mockResolvedValue({ hasUsedTrial: false });
    mockSubscriptionFindUnique.mockResolvedValue({ status: "trialing" });

    const { startTrial } = await import("@/lib/trial");

    await expect(startTrial("user-1")).rejects.toThrow(
      /already has an active subscription/i,
    );
  });

  it("still refuses a user who has already used their trial", async () => {
    mockUserFindUnique.mockResolvedValue({ hasUsedTrial: true });

    const { startTrial } = await import("@/lib/trial");

    await expect(startTrial("user-1")).rejects.toThrow(/not eligible/i);
  });
});
