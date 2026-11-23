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
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  });

  const mode = secretKey.startsWith("sk_test_") ? "test" : "live";
  console.log(`Stripe mode detected: ${mode}`);

  const results: Partial<
    Record<keyof typeof PRICING, { monthly: string; yearly: string }>
  > = {};

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
  for (const [plan, ids] of Object.entries(results)) {
    const prefix = `STRIPE_${plan.toUpperCase()}`;
    console.log(`${prefix}_MONTHLY_PRICE_ID=${ids.monthly}`);
    console.log(`${prefix}_YEARLY_PRICE_ID=${ids.yearly}`);
  }
}

main().catch((error) => {
  console.error("Failed to create Stripe products/prices:");
  console.error(error);
  process.exit(1);
});
