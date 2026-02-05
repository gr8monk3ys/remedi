import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  trackUserEventSafe,
  type UserEventType,
} from "@/lib/analytics/user-events";
import { RATE_LIMITS, withRateLimit } from "@/lib/rate-limit";

const userEventSchema = z.object({
  eventType: z.enum([
    "search",
    "view_remedy",
    "add_favorite",
    "remove_favorite",
    "review_submitted",
    "landing_view",
    "landing_cta_clicked",
  ]),
  eventData: z.record(z.unknown()).optional(),
  page: z.string().optional(),
  referrer: z.string().optional(),
  sessionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { allowed, response } = await withRateLimit(
      request,
      RATE_LIMITS.analytics,
    );
    if (!allowed && response) {
      return response;
    }

    const session = await auth();
    const body = await request.json();
    const parsed = userEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Invalid request",
          },
        },
        { status: 400 },
      );
    }

    const { eventType, eventData, page, referrer, sessionId } = parsed.data;

    await trackUserEventSafe({
      request,
      userId: session?.user?.id,
      sessionId,
      eventType: eventType as UserEventType,
      eventData,
      page,
      referrer,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[user-events] Error tracking event", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to track event",
        },
      },
      { status: 500 },
    );
  }
}
