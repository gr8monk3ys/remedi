import Stripe from "stripe";

import { PLANS } from "../lib/stripe-config";

type PlanConfig = {
  name: string;
  monthly: number;
  yearly: number;
};

const PRICING: Record<"basic" | "premium", PlanConfig> = {
  basic: {
    name: PLANS.basic.name,
    monthly: PLANS.basic.price,
    yearly: PLANS.basic.yearlyPrice,
  },
  premium: {
    name: PLANS.premium.name,
    monthly: PLANS.premium.price,
    yearly: PLANS.premium.yearlyPrice,
  },
};

const currency = "usd";

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

async function getOrCreateProduct(
  stripe: Stripe,
  name: string,
  metadata: Record<string, string>,
): Promise<Stripe.Product> {
  for await (const product of stripe.products.list({ limit: 100 })) {
    if (product.name === name && product.active) {
      return product;
    }
  }

  return stripe.products.create({
    name,
    metadata,
  });
}

async function getOrCreatePrice(params: {
  stripe: Stripe;
  productId: string;
  interval: "month" | "year";
  amountCents: number;
}): Promise<Stripe.Price> {
  const { stripe, productId, interval, amountCents } = params;

  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });

  const existing = prices.data.find(
    (price) =>
      price.recurring &&
      price.recurring.interval === interval &&
      price.unit_amount === amountCents &&
      price.currency === currency,
  );

  if (existing) {
    return existing;
  }

  return stripe.prices.create({
    product: productId,
    currency,
    unit_amount: amountCents,
    recurring: { interval },
  });
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required.");
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });

  const mode = secretKey.startsWith("sk_test_") ? "test" : "live";
  console.log(`Stripe mode detected: ${mode}`);

  const results: Record<string, { monthly: string; yearly: string }> = {};

  for (const plan of Object.keys(PRICING) as Array<keyof typeof PRICING>) {
    const config = PRICING[plan];
    const product = await getOrCreateProduct(stripe, config.name, {
      plan,
    });

    const monthly = await getOrCreatePrice({
      stripe,
      productId: product.id,
      interval: "month",
      amountCents: toCents(config.monthly),
    });

    const yearly = await getOrCreatePrice({
      stripe,
      productId: product.id,
      interval: "year",
      amountCents: toCents(config.yearly),
    });

    results[plan] = {
      monthly: monthly.id,
      yearly: yearly.id,
    };

    console.log(`Created/verified ${config.name} product: ${product.id}`);
  }

  console.log("\nAdd these to your environment variables:");
  console.log(`STRIPE_BASIC_MONTHLY_PRICE_ID=${results.basic.monthly}`);
  console.log(`STRIPE_BASIC_YEARLY_PRICE_ID=${results.basic.yearly}`);
  console.log(`STRIPE_PREMIUM_MONTHLY_PRICE_ID=${results.premium.monthly}`);
  console.log(`STRIPE_PREMIUM_YEARLY_PRICE_ID=${results.premium.yearly}`);
}

main().catch((error) => {
  console.error("Failed to create Stripe products/prices:");
  console.error(error);
  process.exit(1);
});
