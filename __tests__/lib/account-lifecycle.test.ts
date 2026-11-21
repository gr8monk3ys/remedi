/**
 * Account creation and erasure side effects (lib/account-lifecycle.ts),
 * wired into Better Auth's hooks in lib/better-auth.ts.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  subscriptionFindUnique: vi.fn(),
  transaction: vi.fn(),
  emailPreferenceUpsert: vi.fn(),
  webhookEventUpsert: vi.fn(),
  deleteMany: {
    favorite: vi.fn(),
    searchHistory: vi.fn(),
    filterPreference: vi.fn(),
    userEvent: vi.fn(),
    conversionEvent: vi.fn(),
    emailLog: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: (ops: unknown) => db.transaction(ops),
    subscription: { findUnique: db.subscriptionFindUnique },
    emailPreference: { upsert: db.emailPreferenceUpsert },
    webhookEvent: { upsert: db.webhookEventUpsert },
    favorite: { deleteMany: db.deleteMany.favorite },
    searchHistory: { deleteMany: db.deleteMany.searchHistory },
    filterPreference: { deleteMany: db.deleteMany.filterPreference },
    userEvent: { deleteMany: db.deleteMany.userEvent },
    conversionEvent: { deleteMany: db.deleteMany.conversionEvent },
    emailLog: { deleteMany: db.deleteMany.emailLog },
  },
}));

const mockSubscriptionsCancel = vi.fn();
const mockIsStripeConfigured = vi.fn(() => true);
vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: () => mockIsStripeConfigured(),
  getStripe: () => ({
    subscriptions: { cancel: mockSubscriptionsCancel },
  }),
}));

const mockSendWelcomeEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: (...args: unknown[]) => mockSendWelcomeEmail(...args),
}));

import { eraseUserData, onUserCreated } from "@/lib/account-lifecycle";

const USER_ID = "8f0e6a8e-1111-4222-8333-944455556666";

beforeEach(() => {
  vi.clearAllMocks();
  db.transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops));
  for (const fn of Object.values(db.deleteMany)) {
    fn.mockResolvedValue({ count: 0 });
  }
  mockSendWelcomeEmail.mockResolvedValue({ success: true });
});

const armSubscription = (stripeSubscriptionId: string | null): void => {
  db.subscriptionFindUnique.mockResolvedValue(
    stripeSubscriptionId ? { stripeSubscriptionId } : null,
  );
};

describe("onUserCreated", () => {
  const user = { id: USER_ID, email: "new@example.com", name: "New User" };

  it("creates default email preferences and sends the welcome email", async () => {
    await onUserCreated(user);

    expect(db.emailPreferenceUpsert).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      update: {},
      create: {
        userId: USER_ID,
        weeklyDigest: true,
        marketingEmails: false,
        productUpdates: true,
        subscriptionReminders: true,
      },
    });
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
      "new@example.com",
      "New User",
      USER_ID,
    );
  });

  it('greets a user without a name as "there"', async () => {
    await onUserCreated({ ...user, name: null });

    expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
      "new@example.com",
      "there",
      USER_ID,
    );
  });

  it("still sends the welcome email when preferences cannot be created", async () => {
    db.emailPreferenceUpsert.mockRejectedValue(new Error("db down"));

    await onUserCreated(user);

    expect(mockSendWelcomeEmail).toHaveBeenCalled();
  });
});

describe("eraseUserData", () => {
  it("deletes the rows that do not cascade from User, in one transaction", async () => {
    armSubscription(null);

    await eraseUserData(USER_ID);

    for (const fn of Object.values(db.deleteMany)) {
      expect(fn).toHaveBeenCalledWith({ where: { userId: USER_ID } });
    }
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });

  it("cancels the Stripe subscription before the rows that name it are gone", async () => {
    armSubscription("sub_live_123");
    mockSubscriptionsCancel.mockResolvedValue({ status: "canceled" });

    await eraseUserData(USER_ID);

    expect(mockSubscriptionsCancel).toHaveBeenCalledWith("sub_live_123");
    expect(mockSubscriptionsCancel.mock.invocationCallOrder[0]).toBeLessThan(
      db.transaction.mock.invocationCallOrder[0]!,
    );
  });

  it("does not reach for Stripe when there was no subscription", async () => {
    armSubscription(null);

    await eraseUserData(USER_ID);

    expect(mockSubscriptionsCancel).not.toHaveBeenCalled();
  });

  it("still erases the data when Stripe cannot be reached", async () => {
    // The deletion is a legal obligation. Stripe being down does not suspend it.
    armSubscription("sub_live_123");
    mockSubscriptionsCancel.mockRejectedValue(new Error("stripe is down"));

    await eraseUserData(USER_ID);

    expect(db.deleteMany.favorite).toHaveBeenCalled();
  });

  it("records a failed cancellation where an operator will find it", async () => {
    armSubscription("sub_live_123");
    mockSubscriptionsCancel.mockRejectedValue(new Error("stripe is down"));
    db.webhookEventUpsert.mockResolvedValue({ id: "wh-1" });

    await eraseUserData(USER_ID);

    expect(db.webhookEventUpsert).toHaveBeenCalledTimes(1);
    const arg = db.webhookEventUpsert.mock.calls[0]![0] as {
      create: { type: string; status: string; payload: unknown };
    };
    expect(arg.create.type).toBe("account.deleted.subscription_cancel_failed");
    expect(arg.create.status).toBe("failed");
    expect(arg.create.payload).toMatchObject({
      userId: USER_ID,
      stripeSubscriptionId: "sub_live_123",
    });
  });

  it("treats an already-absent subscription as success, not as a failure", async () => {
    armSubscription("sub_live_123");
    mockSubscriptionsCancel.mockRejectedValue(
      Object.assign(new Error("No such subscription"), {
        code: "resource_missing",
      }),
    );

    await eraseUserData(USER_ID);

    expect(db.webhookEventUpsert).not.toHaveBeenCalled();
  });
});
