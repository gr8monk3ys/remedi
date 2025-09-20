import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { hasUpstashRedis } from "@/lib/env";

export async function GET(_request: NextRequest) {
  const currentUser = await getCurrentUser();
  const userIsAdmin = await isAdmin();

  if (!currentUser || !userIsAdmin) {
    return NextResponse.json(
      { ok: false, message: "Admin access required" },
      { status: 403 },
    );
  }

  if (!hasUpstashRedis()) {
    return NextResponse.json({
      ok: false,
      message: "Upstash env vars not configured",
    });
  }

  try {
    const redis = Redis.fromEnv();
    const startedAt = Date.now();
    const pong = await redis.ping();
    const latencyMs = Date.now() - startedAt;

    return NextResponse.json({
      ok: true,
      latencyMs,
      message: typeof pong === "string" ? pong : undefined,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      message: "Failed to reach Upstash Redis",
    });
  }
}
