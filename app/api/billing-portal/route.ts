/**
 * Billing Portal API Endpoint
 *
 * Creates Stripe billing portal sessions for managing subscriptions.
 *
 * POST /api/billing-portal
 * Returns: { url: string } - Stripe billing portal URL
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createBillingPortalSession, isStripeConfigured } from "@/lib/stripe";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import { getBaseUrl } from "@/lib/url";

const logger = createLogger("api-billing-portal");

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = await withRateLimit(request, RATE_LIMITS.billingPortal);
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to manage billing",
          },
        },
        { status: 401 },
      );
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { customerId: true },
    });

    if (!subscription?.customerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_CUSTOMER",
            message: "No billing account found. Please subscribe first.",
          },
        },
        { status: 404 },
      );
    }

    // Get base URL
    const baseUrl = getBaseUrl();

    // Create billing portal session
    const portalSession = await createBillingPortalSession(
      subscription.customerId,
      `${baseUrl}/billing`,
    );

    return NextResponse.json({
      success: true,
      data: { url: portalSession.url },
    });
  } catch (error) {
    logger.error("Error creating portal session", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PORTAL_ERROR",
          message: "Failed to create billing portal session",
        },
      },
      { status: 500 },
    );
  }
}
