/**
 * Our subscription status for a Stripe one.
 *
 * Entitlements are derived from this single field — getEffectivePlanLimits,
 * getTrialStatus and canPerformAction all key off it — so anything that has
 * not actually been paid for must not land on "active". Unknown statuses fall
 * through to "expired" rather than being left alone: failing closed is the
 * right default when money is involved.
 *
 * Shared between the webhook, which writes this on every event, and the
 * reconciliation job, which writes it when an event never arrived. Those two
 * must agree, so there is one mapper rather than one each.
 */
export function subscriptionStatusFor(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "canceled":
      return "cancelled";
    case "paused":
      return "suspended";
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "expired";
    default:
      return "expired";
  }
}

/** Statuses that grant paid entitlements. */
export const ENTITLING_STATUSES = ["active", "trialing"] as const;
