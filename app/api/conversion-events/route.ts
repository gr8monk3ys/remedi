import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  CONVERSION_EVENT_TYPES,
  EVENT_SOURCES,
  trackConversionEvent,
} from "@/lib/analytics/conversion-events";
import { RATE_LIMITS, withRateLimit } from "@/lib/rate-limit";

const conversionEventSchema = z.object({
  eventType: z.enum(
    Object.values(CONVERSION_EVENT_TYPES) as [
      (typeof CONVERSION_EVENT_TYPES)[keyof typeof CONVERSION_EVENT_TYPES],
      ...(typeof CONVERSION_EVENT_TYPES)[keyof typeof CONVERSION_EVENT_TYPES][],
    ],
  ),
  eventSource: z
    .enum(
      Object.values(EVENT_SOURCES) as [
        (typeof EVENT_SOURCES)[keyof typeof EVENT_SOURCES],
        ...(typeof EVENT_SOURCES)[keyof typeof EVENT_SOURCES][],
      ],
    )
    .optional(),
  planTarget: z.enum(["free", "basic", "premium", "enterprise"]).optional(),
  sessionId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
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
    const parsed = conversionEventSchema.safeParse(body);

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

    const { eventType, eventSource, planTarget, sessionId, metadata } =
      parsed.data;

    await trackConversionEvent({
      userId: session?.user?.id,
      sessionId,
      eventType,
      eventSource,
      planTarget,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[conversion-events] Error tracking event", error);
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
