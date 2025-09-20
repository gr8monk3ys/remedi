/**
 * Email Preferences API Route
 *
 * GET  /api/email-preferences - Fetch current user's email preferences
 * PATCH /api/email-preferences - Update current user's email preferences
 *
 * Requires authentication via Clerk.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { z } from "zod";
import { DEFAULT_EMAIL_PREFERENCES } from "@/lib/email/types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-email-preferences");

/**
 * Zod schema for PATCH body - all fields are optional to allow partial updates
 */
const updateEmailPreferencesSchema = z.object({
  weeklyDigest: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  productUpdates: z.boolean().optional(),
  subscriptionReminders: z.boolean().optional(),
});

export type UpdateEmailPreferencesInput = z.infer<
  typeof updateEmailPreferencesSchema
>;

/**
 * GET /api/email-preferences
 *
 * Returns the authenticated user's email preferences.
 * If no preferences record exists, returns the defaults and creates one.
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    // Try to find existing preferences
    let preferences = await prisma.emailPreference.findUnique({
      where: { userId: currentUser.id },
      select: {
        id: true,
        weeklyDigest: true,
        marketingEmails: true,
        productUpdates: true,
        subscriptionReminders: true,
        updatedAt: true,
      },
    });

    // If none exist, create defaults
    if (!preferences) {
      preferences = await prisma.emailPreference.create({
        data: {
          userId: currentUser.id,
          ...DEFAULT_EMAIL_PREFERENCES,
        },
        select: {
          id: true,
          weeklyDigest: true,
          marketingEmails: true,
          productUpdates: true,
          subscriptionReminders: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json(successResponse(preferences));
  } catch (error) {
    logger.error("Error fetching email preferences", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch email preferences"),
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/email-preferences
 *
 * Updates the authenticated user's email preferences.
 * Accepts partial updates (only the fields you want to change).
 */
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    const body = await request.json();
    const validation = updateEmailPreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          validation.error.issues[0]?.message || "Invalid input",
        ),
        { status: 400 },
      );
    }

    const updates = validation.data;

    // Ensure there is at least one field to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        errorResponse("INVALID_INPUT", "No fields provided to update"),
        { status: 400 },
      );
    }

    // Upsert: create with defaults + overrides if it doesn't exist,
    // otherwise just apply the overrides
    const preferences = await prisma.emailPreference.upsert({
      where: { userId: currentUser.id },
      create: {
        userId: currentUser.id,
        ...DEFAULT_EMAIL_PREFERENCES,
        ...updates,
      },
      update: updates,
      select: {
        id: true,
        weeklyDigest: true,
        marketingEmails: true,
        productUpdates: true,
        subscriptionReminders: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(successResponse(preferences));
  } catch (error) {
    logger.error("Error updating email preferences", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to update email preferences"),
      { status: 500 },
    );
  }
}
