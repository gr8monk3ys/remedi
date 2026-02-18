/**
 * Account Data Export
 *
 * GET /api/account/export
 *
 * Exports the authenticated user's data as a downloadable JSON file.
 * This is a paid feature (Basic+ / trial).
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/api/response";
import { getEffectivePlanLimits } from "@/lib/trial";
import {
  canPerformAction,
  incrementUsage,
} from "@/lib/analytics/usage-tracker";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest): Promise<Response> {
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.general,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      errorResponse("UNAUTHORIZED", "You must be signed in to export data."),
      { status: 401 },
    );
  }

  const { limits, plan, isTrial } = await getEffectivePlanLimits(user.id);
  if (!limits.canExport) {
    return NextResponse.json(
      errorResponse(
        "FORBIDDEN",
        "Export is not available on your current plan.",
        {
          plan,
          isTrial,
        },
      ),
      { status: 403 },
    );
  }

  const canExport = await canPerformAction(user.id, "exports");
  if (!canExport.allowed) {
    return NextResponse.json(
      errorResponse("LIMIT_EXCEEDED", "You have reached your export limit.", {
        plan: canExport.plan,
        currentUsage: canExport.currentUsage,
        limit: canExport.limit,
      }),
      { status: 429 },
    );
  }

  const [
    dbUser,
    emailPreference,
    favorites,
    filterPreference,
    searchHistory,
    healthProfile,
    medicationCabinet,
    journalEntries,
    reports,
    subscription,
    usageRecords,
    userEvents,
    conversionEvents,
    emailLogs,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        trialStartDate: true,
        trialEndDate: true,
        hasUsedTrial: true,
      },
    }),
    prisma.emailPreference.findUnique({
      where: { userId: user.id },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.filterPreference.findUnique({
      where: { userId: user.id },
    }),
    prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.healthProfile.findUnique({
      where: { userId: user.id },
    }),
    prisma.medicationCabinet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.remedyJournal.findMany({
      where: { userId: user.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.remedyReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findUnique({
      where: { userId: user.id },
    }),
    prisma.usageRecord.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 120, // ~4 months of daily records
    }),
    prisma.userEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
    prisma.conversionEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
    prisma.emailLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    plan: { plan, isTrial },
    user: dbUser,
    emailPreference,
    favorites,
    filterPreference,
    searchHistory,
    healthProfile,
    medicationCabinet,
    journalEntries,
    reports,
    subscription,
    usageRecords,
    analytics: {
      userEvents,
      conversionEvents,
      emailLogs,
    },
  };

  await incrementUsage(user.id, "exports", 1);

  const body = JSON.stringify(payload, null, 2);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="remedi-data-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
