/**
 * "Your subscription is now active" must be something we know, not something
 * the URL said.
 *
 * Stripe redirects to /billing?success=true the instant checkout completes —
 * typically before the webhook that activates the subscription lands. The
 * banner was rendered from that query parameter alone, so it routinely
 * appeared directly above "Current Plan: Free", and anyone could produce it by
 * visiting the URL directly.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockFindUnique = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    subscription: { findUnique: (...a: unknown[]) => mockFindUnique(...a) },
  },
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(async () => ({ id: "u1", email: "a@b.c" })),
}));

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

vi.mock("./billing-client", () => ({}));
vi.mock("@/app/billing/billing-client", () => ({
  BillingClient: () => <div data-testid="billing-client" />,
}));

import BillingPage from "@/app/billing/page";

const renderPage = async (
  params: Record<string, string>,
  subscription: unknown,
): Promise<void> => {
  mockFindUnique.mockResolvedValue(subscription);
  const ui = await BillingPage({
    searchParams: Promise.resolve(params),
  } as never);
  render(ui as React.ReactElement);
};

describe("/billing success banner", () => {
  beforeEach(() => vi.clearAllMocks());

  it("claims the subscription is active only when the record says so", async () => {
    await renderPage(
      { success: "true" },
      { plan: "premium", status: "active" },
    );
    expect(screen.getByText(/subscription is now active/i)).toBeInTheDocument();
  });

  it("does not claim activation while the webhook is still in flight", async () => {
    // The common real case: Stripe has redirected, our row is still free.
    await renderPage({ success: "true" }, null);

    expect(
      screen.queryByText(/subscription is now active/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/we have your payment/i)).toBeInTheDocument();
    expect(screen.getByText(/still confirming it/i)).toBeInTheDocument();
  });

  it("cannot be conjured by visiting the URL directly", async () => {
    await renderPage({ success: "true" }, { plan: "free", status: "active" });
    expect(
      screen.queryByText(/subscription is now active/i),
    ).not.toBeInTheDocument();
  });

  it("does not treat an unpaid subscription as active", async () => {
    await renderPage(
      { success: "true" },
      { plan: "premium", status: "expired" },
    );
    expect(
      screen.queryByText(/subscription is now active/i),
    ).not.toBeInTheDocument();
  });

  it("shows no banner at all without the success parameter", async () => {
    await renderPage({}, { plan: "premium", status: "active" });
    expect(
      screen.queryByText(/subscription is now active/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/we have your payment/i)).not.toBeInTheDocument();
  });
});
