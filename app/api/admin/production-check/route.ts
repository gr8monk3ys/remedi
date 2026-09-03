import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { runProductionChecks } from "@/lib/production-readiness";
import {
  successResponse,
  errorResponse,
  getStatusCode,
} from "@/lib/api/response";

export async function POST(_request: NextRequest) {
  const currentUser = await getCurrentUser();
  const userIsAdmin = await isAdmin();

  if (!currentUser || !userIsAdmin) {
    return NextResponse.json(
      errorResponse("FORBIDDEN", "Admin access required"),
      { status: getStatusCode("FORBIDDEN") },
    );
  }

  try {
    const result = await runProductionChecks();
    return NextResponse.json(successResponse(result));
  } catch {
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Production checks failed"),
      { status: getStatusCode("INTERNAL_ERROR") },
    );
  }
}
