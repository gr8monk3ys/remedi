/**
 * Checkout API Endpoint
 *
 * Creates Stripe checkout sessions for subscription purchases.
 * Supports optional trial periods for eligible users.
 *
 * POST /api/checkout
 * Body: { priceId: string, withTrial?: boolean }
 * Returns: { url: string } - Stripe checkout URL
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createCheckoutSession,
  getOrCreateStripeCustomer,
  isStripeConfigured,
  getPlanByPriceId,
  PRICE_IDS,
} from "@/lib/stripe";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { isTrialEligible } from "@/lib/trial";
import {
  trackConversionEvent,
  CONVERSION_EVENT_TYPES,
  EVENT_SOURCES,
  type ConversionEventSource,
} from "@/lib/analytics/conversion-events";
import { z } from "zod";

// Build map of plan+interval to price IDs
const PLAN_PRICE_MAP: Record<string, string | undefined> = {
  basic_month: PRICE_IDS.basic.monthly,
  basic_year: PRICE_IDS.basic.yearly,
  premium_month: PRICE_IDS.premium.monthly,
  premium_year: PRICE_IDS.premium.yearly,
};

const checkoutSchema = z
  .object({
    // Support both direct priceId (legacy) and plan+interval
    priceId: z.string().optional(),
    plan: z.enum(["basic", "premium"]).optional(),
    interval: z.enum(["month", "year"]).optional(),
    withTrial: z.boolean().optional().default(false),
    source: z.string().optional(),
  })
  .refine(
    (data) => data.priceId || (data.plan && data.interval),
    "Either priceId or both plan and interval are required",
  );

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = await withRateLimit(request, RATE_LIMITS.checkout);
    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "STRIPE_NOT_CONFIGURED",
            message: "Payment system is not configured",
          },
        },
        { status: 503 },
      );
    }

    // Authenticate user
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to subscribe",
          },
        },
        { status: 401 },
      );
    }

    // Validate request body
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      // Zod v4 uses 'issues' instead of 'errors'
      const firstIssue = parsed.error.issues?.[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: firstIssue?.message || "Validation failed",
          },
        },
        { status: 400 },
      );
    }

    const {
      priceId: directPriceId,
      plan,
      interval,
      withTrial,
      source,
    } = parsed.data;

    // Resolve priceId from plan+interval or use direct priceId
    let priceId: string;
    let targetPlan: "basic" | "premium";

    if (plan && interval) {
      // New approach: look up price ID from plan and interval
      const key = `${plan}_${interval}`;
      const resolvedPriceId = PLAN_PRICE_MAP[key];
      if (!resolvedPriceId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_PLAN",
              message: `Price not configured for ${plan} ${interval}ly plan`,
            },
          },
          { status: 400 },
        );
      }
      priceId = resolvedPriceId;
      targetPlan = plan;
    } else if (directPriceId) {
      // Legacy approach: validate direct price ID
      const validPriceIds = new Set(
        Object.values(PLAN_PRICE_MAP).filter(Boolean),
      );
      if (!validPriceIds.has(directPriceId)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_PRICE",
              message: "Invalid price ID",
            },
          },
          { status: 400 },
        );
      }
      priceId = directPriceId;
      const resolvedPlan = getPlanByPriceId(directPriceId);
      targetPlan =
        resolvedPlan === "basic" || resolvedPlan === "premium"
          ? resolvedPlan
          : "basic";
    } else {
      // This shouldn't happen due to Zod validation, but TypeScript needs it
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Either priceId or both plan and interval are required",
          },
        },
        { status: 400 },
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email,
      session.user.name || undefined,
    );

    // Check trial eligibility if trial is requested
    let trialPeriodDays: number | undefined;
    if (withTrial) {
      const eligible = await isTrialEligible(session.user.id);
      if (eligible) {
        trialPeriodDays = 7; // 7-day trial
      }
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      userId: session.user.id,
      successUrl: `${baseUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/billing?canceled=true`,
      trialPeriodDays,
    });

    // Track checkout started event
    await trackConversionEvent({
      userId: session.user.id,
      eventType: CONVERSION_EVENT_TYPES.CHECKOUT_STARTED,
      eventSource:
        (source as ConversionEventSource) || EVENT_SOURCES.PRICING_PAGE,
      planTarget: targetPlan,
      metadata: {
        priceId,
        withTrial: !!trialPeriodDays,
      },
    });

    return NextResponse.json({
      success: true,
      data: { url: checkoutSession.url },
    });
  } catch (error) {
    console.error("[checkout] Error creating checkout session:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CHECKOUT_ERROR",
          message: "Failed to create checkout session",
        },
      },
      { status: 500 },
    );
  }
}
