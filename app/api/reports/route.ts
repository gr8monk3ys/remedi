/**
 * Remedy Reports API Route
 *
 * GET /api/reports - List user's reports
 * POST /api/reports - Generate a new report
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserReports,
  createReport,
  updateReportContent,
  countMonthlyReports,
} from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api/response";
import { reportGenerateSchema } from "@/lib/validations/reports";
import { getValidationErrorMessage } from "@/lib/validations/api";
import { createLogger } from "@/lib/logger";
import { getPlanLimits, isWithinLimit } from "@/lib/stripe-config";
import type { PlanType } from "@/lib/stripe-config";
import { generateRemedyReport } from "@/lib/ai/report-generator";

const logger = createLogger("reports-api");

async function getUserPlan(userId: string): Promise<PlanType> {
  const { prisma } = await import("@/lib/db");
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });
  if (sub && sub.status === "active") {
    return sub.plan as PlanType;
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

    const page = Number(request.nextUrl.searchParams.get("page") || "1");
    const pageSize = Number(
      request.nextUrl.searchParams.get("pageSize") || "10",
    );

    const result = await getUserReports(user.id, page, pageSize);

    return NextResponse.json(
      successResponse(result, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      }),
    );
  } catch (error) {
    logger.error("Error fetching reports:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch reports"),
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
    const monthlyCount = await countMonthlyReports(user.id);

    if (!isWithinLimit(limits.maxReportsPerMonth, monthlyCount)) {
      return NextResponse.json(
        errorResponse(
          "FORBIDDEN",
          limits.maxReportsPerMonth === 0
            ? "AI remedy reports require a Basic plan or higher"
            : `You've used all ${limits.maxReportsPerMonth} reports this month. Upgrade for more.`,
        ),
        { status: 403 },
      );
    }

    const body = await request.json();
    const validation = reportGenerateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(
          "INVALID_INPUT",
          getValidationErrorMessage(validation.error),
        ),
        { status: 400 },
      );
    }

    // Create report record
    const report = await createReport(user.id, {
      title: validation.data.title,
      queryType: validation.data.queryType,
      queryInput: validation.data.queryInput,
    });

    // Generate report content asynchronously (non-blocking)
    generateRemedyReport({
      reportId: report.id,
      userId: user.id,
      queryType: validation.data.queryType,
      queryInput: validation.data.queryInput,
      includeCabinetInteractions: validation.data.includeCabinetInteractions,
      includeJournalData: validation.data.includeJournalData,
    })
      .then((content) => updateReportContent(report.id, content, "complete"))
      .catch((error) => {
        logger.error("Report generation failed:", error);
        updateReportContent(
          report.id,
          { error: "Report generation failed" },
          "failed",
        );
      });

    return NextResponse.json(
      successResponse({
        report,
        message: "Report generation started",
      }),
      { status: 201 },
    );
  } catch (error) {
    logger.error("Error creating report:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to create report"),
      { status: 500 },
    );
  }
}
