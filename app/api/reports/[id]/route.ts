/**
 * Single Report API Route
 *
 * GET /api/reports/[id] - Get a report by ID
 * DELETE /api/reports/[id] - Delete a report
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getReportById, deleteReport } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createLogger } from "@/lib/logger";

const logger = createLogger("report-detail-api");

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    const { id } = await params;

    const report = await getReportById(id);
    if (!report || report.userId !== user.id) {
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", "Report not found"),
        { status: 404 },
      );
    }

    return NextResponse.json(successResponse({ report }));
  } catch (error) {
    logger.error("Error fetching report:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch report"),
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Authentication required"),
        { status: 401 },
      );
    }

    const { id } = await params;

    const report = await getReportById(id);
    if (!report || report.userId !== user.id) {
      return NextResponse.json(
        errorResponse("RESOURCE_NOT_FOUND", "Report not found"),
        { status: 404 },
      );
    }

    await deleteReport(id);

    return NextResponse.json(successResponse({ message: "Report deleted" }));
  } catch (error) {
    logger.error("Error deleting report:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to delete report"),
      { status: 500 },
    );
  }
}
