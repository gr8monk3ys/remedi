/**
 * User Event Tracking
 *
 * Stores behavioral events (searches, views, favorites, reviews, etc.)
 * for activation and retention analysis.
 */

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";

export type UserEventType =
  | "search"
  | "view_remedy"
  | "add_favorite"
  | "remove_favorite"
  | "review_submitted"
  | "landing_view"
  | "landing_cta_clicked";

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    return first?.trim() || null;
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.ANALYTICS_IP_SALT || process.env.AUTH_SECRET || "";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

export async function trackUserEvent(params: {
  request?: NextRequest;
  userId?: string;
  sessionId?: string;
  eventType: UserEventType;
  eventData?: Record<string, unknown>;
  page?: string;
  referrer?: string;
}): Promise<void> {
  const { request, userId, sessionId, eventType, eventData, page, referrer } =
    params;

  const userAgent = request?.headers.get("user-agent") || undefined;
  const ipHash = request ? hashIp(getClientIp(request)) : undefined;
  const pagePath =
    page ?? (request ? new URL(request.url).pathname : undefined);
  const referrerHeader =
    referrer ?? request?.headers.get("referer") ?? undefined;

  await prisma.userEvent.create({
    data: {
      userId,
      sessionId,
      eventType,
      eventData: eventData as Prisma.InputJsonValue | undefined,
      page: pagePath,
      referrer: referrerHeader,
      userAgent,
      ipHash,
    },
  });
}

export async function trackUserEventSafe(
  params: Parameters<typeof trackUserEvent>[0],
): Promise<void> {
  try {
    await trackUserEvent(params);
  } catch (error) {
    console.error("[analytics] Failed to track user event", error);
  }
}
