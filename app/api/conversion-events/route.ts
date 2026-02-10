import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  CONVERSION_EVENT_TYPES,
  EVENT_SOURCES,
  trackConversionEvent,
} from "@/lib/analytics/conversion-events";
import { RATE_LIMITS, withRateLimit } from "@/lib/rate-limit";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-conversion-events");

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
  planTarget: z.enum(["free", "basic", "premium"]).optional(),
  sessionId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
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

    const user = await getCurrentUser();
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
      userId: user?.id,
      sessionId,
      eventType,
      eventSource,
      planTarget,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error tracking event", error);
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
