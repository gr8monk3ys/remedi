import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";

const SENTRY_BASE = "https://sentry.io/api/0";
const CACHE_TTL_SECONDS = Number(process.env.SENTRY_STATS_TTL || "60");
let cachedAt = 0;
let cachedResponse: {
  ok: boolean;
  errorCount24h?: number;
  lastEventAt?: string | null;
  message?: string;
} | null = null;

function requiredEnv(name: string): string | null {
  const value = process.env[name];
  return value ? value : null;
}

export async function GET(_request: NextRequest) {
  const currentUser = await getCurrentUser();
  const userIsAdmin = await isAdmin();

  if (!currentUser || !userIsAdmin) {
    return NextResponse.json(
      { ok: false, message: "Admin access required" },
      { status: 403 },
    );
  }

  const org = requiredEnv("SENTRY_ORG");
  const project = requiredEnv("SENTRY_PROJECT");
  const token = requiredEnv("SENTRY_AUTH_TOKEN");

  if (!org || !project || !token) {
    const payload = {
      ok: false,
      message: "Sentry env vars not configured",
    };
    return NextResponse.json(payload);
  }

  if (cachedResponse && Date.now() - cachedAt < CACHE_TTL_SECONDS * 1000) {
    return NextResponse.json(cachedResponse);
  }

  const end = Math.floor(Date.now() / 1000);
  const start = end - 24 * 60 * 60;
  const url = `${SENTRY_BASE}/projects/${org}/${project}/stats/?since=${start}&until=${end}&resolution=1h`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const payload = {
        ok: false,
        message: `Sentry API error (${res.status})`,
      };
      cachedAt = Date.now();
      cachedResponse = payload;
      return NextResponse.json(payload);
    }

    const data = (await res.json()) as Array<[number, number]>;
    const total = data.reduce((sum, [, count]) => sum + count, 0);
    const lastPoint = data[data.length - 1];
    const lastEventAt = lastPoint
      ? new Date(lastPoint[0] * 1000).toISOString()
      : null;

    const payload = {
      ok: true,
      errorCount24h: total,
      lastEventAt,
    };
    cachedAt = Date.now();
    cachedResponse = payload;
    return NextResponse.json(payload);
  } catch {
    const payload = {
      ok: false,
      message: "Failed to fetch Sentry stats",
    };
    cachedAt = Date.now();
    cachedResponse = payload;
    return NextResponse.json(payload);
  }
}
