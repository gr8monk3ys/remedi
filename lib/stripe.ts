/**
 * Stripe Server Utilities
 *
 * Provides Stripe client initialization and helper functions
 * for subscription management.
 *
 * IMPORTANT: This module is server-only (uses STRIPE_SECRET_KEY).
 * For client-safe config (PLANS, types), use `lib/stripe-config.ts` instead.
 */

import "server-only";
import Stripe from "stripe";
import {
  getStripe as getKitStripe,
  stripe as kitStripe,
  createCheckoutSession as createKitCheckoutSession,
  createBillingPortalSession as createKitBillingPortalSession,
  isStripeConfigured,
  getStripeMode,
  type StripeMode,
} from "@gr8monk3ys/next-kit/stripe";

// Re-export client-safe config for convenience in server code
export {
  PLANS,
  PLAN_LIMITS,
  type PlanType,
  type PlanLimits,
  getPlanLimits,
  isWithinLimit,
  getUsagePercentage,
  isPlanFeatureAvailable,
  getPlanLimit,
  parsePlanType,
} from "./stripe-config";

import { type PlanType } from "./stripe-config";

/**
 * Get the Stripe client (lazy initialization).
 *
 * The client itself is the kit's memoized singleton; this wrapper adds the two
 * things that are ours: the API version we are pinned to, and the requirement
 * that the key come from STRIPE_SECRET_KEY specifically (the kit also accepts
 * STRIPE_API_KEY, which this app does not set).
 */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return getKitStripe({ config: { apiVersion: "2026-05-27.dahlia" } });
}

/**
 * The lazily-constructed Stripe client. Property access builds it on first use,
 * so importing this module never touches the secret.
 */
export const stripe = kitStripe;

export { isStripeConfigured, getStripeMode, type StripeMode };

/**
 * Price IDs configuration (server-only)
 * These are populated from environment variables
 */
export const PRICE_IDS = {
  basic: {
    monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
  },
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  },
} as const;

/**
 * Get plan by Stripe price ID
 */
export function getPlanByPriceId(priceId: string): PlanType | null {
  if (
    priceId === PRICE_IDS.basic.monthly ||
    priceId === PRICE_IDS.basic.yearly
  ) {
    return "basic";
  }
  if (
    priceId === PRICE_IDS.premium.monthly ||
    priceId === PRICE_IDS.premium.yearly
  ) {
    return "premium";
  }
  return null;
}

/**
 * Get price ID for a plan
 */
export function getPriceId(
  plan: "basic" | "premium",
  interval: "monthly" | "yearly",
): string | undefined {
  return PRICE_IDS[plan][interval];
}

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string,
): Promise<string> {
  // First, check if we already have a customer ID stored
  const { prisma } = await import("@/lib/db");
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { customerId: true },
  });

  if (subscription?.customerId) {
    return subscription.customerId;
  }

  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    const customerId = existingCustomers.data[0].id;

    // Store the customer ID
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        customerId,
        plan: "free",
        status: "active",
      },
      update: { customerId },
    });

    return customerId;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });

  // Store the customer ID
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      customerId: customer.id,
      plan: "free",
      status: "active",
    },
    update: { customerId: customer.id },
  });

  return customer.id;
}

/**
 * Create a checkout session for a subscription
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  successUrl,
  cancelUrl,
  trialPeriodDays,
}: {
  customerId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
}): Promise<Stripe.Checkout.Session> {
  return createKitCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    trialPeriodDays,
    metadata: { userId },
    overrides: { payment_method_types: ["card"] },
  });
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  return createKitBillingPortalSession({ customerId, returnUrl });
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export type StripeInvoiceSummary = {
  id: string;
  number: string | null;
  status: Stripe.Invoice.Status | null;
  currency: string;
  amountDue: number;
  amountPaid: number;
  created: number;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  periodStart: number | null;
  periodEnd: number | null;
};

/**
 * List recent invoices for a Stripe customer.
 *
 * Note: amounts are returned in the smallest currency unit (e.g. cents).
 */
export async function listCustomerInvoices(
  customerId: string,
  { limit = 10 }: { limit?: number } = {},
): Promise<StripeInvoiceSummary[]> {
  const invoices = await getStripe().invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number ?? null,
    status: inv.status ?? null,
    currency: inv.currency,
    amountDue: inv.amount_due,
    amountPaid: inv.amount_paid,
    created: inv.created,
    hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    invoicePdf: inv.invoice_pdf ?? null,
    periodStart: inv.period_start ?? null,
    periodEnd: inv.period_end ?? null,
  }));
}
