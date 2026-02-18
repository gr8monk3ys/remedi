/**
 * Dashboard Search History Export
 *
 * GET /api/dashboard/history/export?format=csv|json
 *
 * Exports the authenticated user's search history as a downloadable file.
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

type ExportFormat = "csv" | "json";

function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""');
  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
}

function toCsv(
  rows: Array<{ query: string; resultsCount: number; createdAt: Date }>,
): string {
  const header = ["query", "resultsCount", "createdAt"].join(",");
  const lines = rows.map((row) =>
    [
      csvEscape(row.query),
      String(row.resultsCount),
      row.createdAt.toISOString(),
    ].join(","),
  );
  return [header, ...lines].join("\n");
}

export async function GET(request: NextRequest): Promise<Response> {
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.searchHistory,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      errorResponse("UNAUTHORIZED", "You must be signed in to export history."),
      { status: 401 },
    );
  }

  const { limits, plan, isTrial } = await getEffectivePlanLimits(user.id);

  if (!limits.canAccessHistory) {
    return NextResponse.json(
      errorResponse(
        "FORBIDDEN",
        "Search history is not available on your current plan.",
        { plan, isTrial },
      ),
      { status: 403 },
    );
  }

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

  const formatParam = request.nextUrl.searchParams.get("format");
  const format: ExportFormat = formatParam === "json" ? "json" : "csv";

  if (formatParam && formatParam !== "csv" && formatParam !== "json") {
    return NextResponse.json(
      errorResponse("INVALID_INPUT", 'Invalid format. Use "csv" or "json".'),
      { status: 400 },
    );
  }

  const history = await prisma.searchHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      query: true,
      resultsCount: true,
      createdAt: true,
    },
  });

  await incrementUsage(user.id, "exports", 1);

  if (format === "json") {
    const body = JSON.stringify(
      history.map((h) => ({
        query: h.query,
        resultsCount: h.resultsCount,
        createdAt: h.createdAt.toISOString(),
      })),
      null,
      2,
    );

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="search-history.json"',
        "Cache-Control": "no-store",
      },
    });
  }

  const body = toCsv(history);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="search-history.csv"',
      "Cache-Control": "no-store",
    },
  });
}
