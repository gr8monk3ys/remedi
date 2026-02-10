/**
 * Usage Stats API
 *
 * GET /api/usage
 * Returns the user's current usage statistics and plan limits.
 *
 * POST /api/usage
 * Records a usage event (search, AI search, export, comparison).
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-usage");
import {
  getUsageSummary,
  incrementUsage,
  canPerformAction,
  getUsageHistory,
  getAggregateUsage,
  type UsageType,
} from "@/lib/analytics/usage-tracker";
import { getTrialStatus } from "@/lib/trial";

/**
 * GET /api/usage
 * Get current usage summary
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to view usage",
          },
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get("history") === "true";
    const includeAggregate = searchParams.get("aggregate") === "true";
    const days = parseInt(searchParams.get("days") || "30", 10);

    // Get usage summary
    const summary = await getUsageSummary(user.id);

    // Get trial status
    const trialStatus = await getTrialStatus(user.id);

    // Build response
    const response: Record<string, unknown> = {
      ...summary,
      trial: {
        isActive: trialStatus.isActive,
        isEligible: trialStatus.isEligible,
        daysRemaining: trialStatus.daysRemaining,
        endDate: trialStatus.endDate,
      },
    };

    // Include history if requested
    if (includeHistory) {
      response.history = await getUsageHistory(user.id, days);
    }

    // Include aggregate stats if requested
    if (includeAggregate) {
      response.aggregate = await getAggregateUsage(user.id, days);
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error("Error getting usage", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get usage data",
        },
      },
      { status: 500 },
    );
  }
}

// Validation schema for usage recording
const recordUsageSchema = z.object({
  type: z.enum(["searches", "aiSearches", "exports", "comparisons"]),
  amount: z.number().int().positive().optional().default(1),
});

/**
 * POST /api/usage
 * Record a usage event
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to record usage",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = recordUsageSchema.safeParse(body);

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

    const { type, amount } = parsed.data;

    // Check if action is allowed before incrementing
    const canPerform = await canPerformAction(user.id, type as UsageType);

    if (!canPerform.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LIMIT_EXCEEDED",
            message: `You have reached your daily ${type} limit`,
            data: {
              currentUsage: canPerform.currentUsage,
              limit: canPerform.limit,
              plan: canPerform.plan,
            },
          },
        },
        { status: 429 },
      );
    }

    // Increment usage
    const result = await incrementUsage(user.id, type as UsageType, amount);

    // Check if this increment caused the limit to be exceeded
    if (!result.isNowWithinLimit) {
      return NextResponse.json({
        success: true,
        data: {
          recorded: true,
          newCount: result.newCount,
          limitReached: true,
          message: `You have reached your daily ${type} limit`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        recorded: true,
        newCount: result.newCount,
        limitReached: false,
      },
    });
  } catch (error) {
    logger.error("Error recording usage", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to record usage",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Check if a specific action can be performed
 * GET /api/usage/check?type=searches
 */
export async function HEAD(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(null, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as UsageType;

    if (
      !type ||
      !["searches", "aiSearches", "exports", "comparisons"].includes(type)
    ) {
      return new NextResponse(null, { status: 400 });
    }

    const canPerform = await canPerformAction(user.id, type);

    if (canPerform.allowed) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "X-Usage-Current": canPerform.currentUsage.toString(),
          "X-Usage-Limit": canPerform.limit.toString(),
          "X-Usage-Plan": canPerform.plan,
        },
      });
    } else {
      return new NextResponse(null, {
        status: 429,
        headers: {
          "X-Usage-Current": canPerform.currentUsage.toString(),
          "X-Usage-Limit": canPerform.limit.toString(),
          "X-Usage-Plan": canPerform.plan,
        },
      });
    }
  } catch (error) {
    logger.error("Usage check failed", error);
    return new NextResponse(null, { status: 500 });
  }
}
