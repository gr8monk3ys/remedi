/**
 * Admin Subscription API Route
 *
 * PATCH /api/admin/subscriptions/[id] - Update subscription
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { z } from "zod";

const updateSubscriptionSchema = z.object({
  action: z.enum(["upgrade", "cancel", "reactivate", "suspend"]),
  plan: z.enum(["free", "basic", "premium", "enterprise"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const userIsAdmin = await isAdmin();

    if (!currentUser || !userIsAdmin) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Admin access required"),
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateSubscriptionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse("INVALID_INPUT", validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const { action, plan } = validation.data;
    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "upgrade":
        if (!plan) {
          return NextResponse.json(
            errorResponse("INVALID_INPUT", "Plan is required for upgrade"),
            { status: 400 }
          );
        }
        updateData = {
          plan,
          status: "active",
          cancelledAt: null,
        };
        break;

      case "cancel":
        updateData = {
          status: "cancelled",
          cancelledAt: new Date(),
        };
        break;

      case "reactivate":
        updateData = {
          status: "active",
          cancelledAt: null,
        };
        break;

      case "suspend":
        updateData = {
          status: "suspended",
        };
        break;
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(successResponse(subscription));
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to update subscription"),
      { status: 500 }
    );
  }
}
