/**
 * Medication Cabinet API Route
 *
 * GET /api/medication-cabinet - Get all medications
 * POST /api/medication-cabinet - Add a medication
 * PUT /api/medication-cabinet - Update a medication
 * DELETE /api/medication-cabinet?id=<id> - Remove a medication
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getMedications,
  getMedicationById,
  addMedication,
  updateMedication,
  removeMedication,
  countMedications,
} from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api/response";
import {
  medicationSchema,
  medicationUpdateSchema,
} from "@/lib/validations/health-profile";
import { getValidationErrorMessage } from "@/lib/validations/api";
import { createLogger } from "@/lib/logger";
import {
  getPlanLimits,
  isWithinLimit,
  parsePlanType,
} from "@/lib/stripe-config";
import type { PlanType } from "@/lib/stripe-config";

const logger = createLogger("medication-cabinet-api");

async function getUserPlan(userId: string): Promise<PlanType> {
  const { prisma } = await import("@/lib/db");
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });
  if (sub && sub.status === "active") {
    return parsePlanType(sub.plan);
  }
  return "free";
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    const medications = await getMedications(user.id);

    return NextResponse.json(
      successResponse({
        medications,
        count: medications.length,
      }),
    );
  } catch (error) {
    logger.error("Error fetching medications:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch medications"),
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    // Check plan limit
    const plan = await getUserPlan(user.id);
    const limits = getPlanLimits(plan);
    const currentCount = await countMedications(user.id);

    if (!isWithinLimit(limits.maxMedications, currentCount)) {
      return NextResponse.json(
        errorResponse(
          "FORBIDDEN",
          `You've reached the maximum of ${limits.maxMedications} medications on your ${plan} plan. Upgrade for more.`,
        ),
        { status: 403 },
      );
    }

    const body = await request.json();
    const validation = medicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    const medication = await addMedication(user.id, validation.data);

    return NextResponse.json(
      successResponse({
        medication,
        message: "Medication added",
      }),
      { status: 201 },
    );
  } catch (error) {
    logger.error("Error adding medication:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        errorResponse("CONFLICT", "This medication is already in your cabinet"),
        { status: 409 },
      );
    }

    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to add medication"),
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    const body = await request.json();
    const validation = medicationUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    const { id, ...updates } = validation.data;

    // Verify ownership
    const existing = await getMedicationById(id);
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", "Medication not found"),
        { status: 404 },
      );
    }

    const medication = await updateMedication(id, updates);

    return NextResponse.json(
      successResponse({
        medication,
        message: "Medication updated",
      }),
    );
  } catch (error) {
    logger.error("Error updating medication:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to update medication"),
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        errorResponse("INVALID_INPUT", "Medication ID is required"),
        { status: 400 },
      );
    }

    // Verify ownership
    const existing = await getMedicationById(id);
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", "Medication not found"),
        { status: 404 },
      );
    }

    await removeMedication(id);

    return NextResponse.json(
      successResponse({ message: "Medication removed" }),
    );
  } catch (error) {
    logger.error("Error removing medication:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to remove medication"),
      { status: 500 },
    );
  }
}
