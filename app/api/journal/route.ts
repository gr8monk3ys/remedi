/**
 * Remedy Journal API Route
 *
 * GET /api/journal - Get journal entries (paginated, filterable)
 * POST /api/journal - Create a journal entry
 * PUT /api/journal - Update a journal entry
 * DELETE /api/journal?id=<id> - Delete a journal entry
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalEntryById,
  getJournalEntries,
  getTrackedRemedies,
} from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api/response";
import {
  journalEntrySchema,
  journalEntryUpdateSchema,
  journalQuerySchema,
} from "@/lib/validations/journal";
import { getValidationErrorMessage } from "@/lib/validations/api";
import { createLogger } from "@/lib/logger";
import { getPlanLimits, parsePlanType } from "@/lib/stripe-config";
import type { PlanType } from "@/lib/stripe-config";

const logger = createLogger("journal-api");

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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    // Check plan - journal requires Basic+
    const plan = await getUserPlan(user.id);
    const limits = getPlanLimits(plan);
    if (!limits.canTrackJournal) {
      return NextResponse.json(
        errorResponse(
          "FORBIDDEN",
          "Remedy tracking journal requires a Basic plan or higher",
        ),
        { status: 403 },
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Check if requesting tracked remedies list
    if (searchParams.get("tracked") === "true") {
      const remedies = await getTrackedRemedies(user.id);
      return NextResponse.json(successResponse({ remedies }));
    }

    const queryParams = {
      remedyId: searchParams.get("remedyId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
    };

    const validation = journalQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    const result = await getJournalEntries(user.id, validation.data);

    return NextResponse.json(
      successResponse(result, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      }),
    );
  } catch (error) {
    logger.error("Error fetching journal entries:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch journal entries"),
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

    // Check plan
    const plan = await getUserPlan(user.id);
    const limits = getPlanLimits(plan);
    if (!limits.canTrackJournal) {
      return NextResponse.json(
        errorResponse(
          "FORBIDDEN",
          "Remedy tracking journal requires a Basic plan or higher",
        ),
        { status: 403 },
      );
    }

    const body = await request.json();
    const validation = journalEntrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    const entry = await createJournalEntry(user.id, validation.data);

    return NextResponse.json(
      successResponse({ entry, message: "Journal entry created" }),
      { status: 201 },
    );
  } catch (error) {
    logger.error("Error creating journal entry:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        errorResponse(
          "CONFLICT",
          "You already have a journal entry for this remedy on this date",
        ),
        { status: 409 },
      );
    }

    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to create journal entry"),
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
    const validation = journalEntryUpdateSchema.safeParse(body);

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
    const existing = await getJournalEntryById(id);
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", "Journal entry not found"),
        { status: 404 },
      );
    }

    const entry = await updateJournalEntry(id, updates);

    return NextResponse.json(
      successResponse({ entry, message: "Journal entry updated" }),
    );
  } catch (error) {
    logger.error("Error updating journal entry:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to update journal entry"),
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
        errorResponse("INVALID_INPUT", "Journal entry ID is required"),
        { status: 400 },
      );
    }

    // Verify ownership
    const existing = await getJournalEntryById(id);
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", "Journal entry not found"),
        { status: 404 },
      );
    }

    await deleteJournalEntry(id);

    return NextResponse.json(
      successResponse({ message: "Journal entry deleted" }),
    );
  } catch (error) {
    logger.error("Error deleting journal entry:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to delete journal entry"),
      { status: 500 },
    );
  }
}
