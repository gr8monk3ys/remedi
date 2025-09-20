import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { runProductionChecks } from "@/lib/production-readiness";

export async function POST(_request: NextRequest) {
  const currentUser = await getCurrentUser();
  const userIsAdmin = await isAdmin();

  if (!currentUser || !userIsAdmin) {
    return NextResponse.json(
      { ok: false, message: "Admin access required" },
      { status: 403 },
    );
  }

  try {
    const result = await runProductionChecks();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, message: "Production checks failed" },
      { status: 500 },
    );
  }
}
