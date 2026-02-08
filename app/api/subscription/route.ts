/**
 * Subscription API Endpoint
 *
 * Gets the current user's subscription status.
 *
 * GET /api/subscription
 * Returns: { plan, status, expiresAt, ... }
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS, type PlanType } from "@/lib/stripe";

export async function GET() {
  try {
    // Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to view subscription",
          },
        },
        { status: 401 },
      );
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // Default to free plan if no subscription
    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          plan: "free" as PlanType,
          planDetails: PLANS.free,
          status: "active",
          isActive: true,
          canUpgrade: true,
        },
      });
    }

    const plan = subscription.plan as PlanType;
    const planDetails = PLANS[plan] || PLANS.free;

    return NextResponse.json({
      success: true,
      data: {
        id: subscription.id,
        plan,
        planDetails,
        status: subscription.status,
        interval: subscription.interval,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        isActive: subscription.status === "active",
        canUpgrade: plan === "free" || plan === "basic",
        canManage: !!subscription.stripeSubscriptionId,
      },
    });
  } catch (error) {
    console.error("[subscription] Error fetching subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SUBSCRIPTION_ERROR",
          message: "Failed to fetch subscription",
        },
      },
      { status: 500 },
    );
  }
}
