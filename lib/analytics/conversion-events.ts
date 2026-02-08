/**
 * Conversion Events Tracking (Server-Only)
 *
 * Tracks conversion funnel events for analyzing upgrade paths and optimizing
 * monetization. Events are stored in the database for reporting and A/B testing.
 *
 * For client-safe constants and types, import from
 * '@/lib/analytics/conversion-event-types' instead.
 */

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { PlanType } from "@/lib/stripe-config";

// Re-export constants and types so existing server-side imports continue to work
export {
  CONVERSION_EVENT_TYPES,
  EVENT_SOURCES,
  type ConversionEventType,
  type EventSource,
  type ConversionEventMetadata,
} from "./conversion-event-types";

/**
 * Track a conversion event
 */
export async function trackConversionEvent(params: {
  userId?: string;
  sessionId?: string;
  eventType: ConversionEventType;
  eventSource?: EventSource;
  planTarget?: PlanType;
  metadata?: ConversionEventMetadata;
}): Promise<string> {
  const { userId, sessionId, eventType, eventSource, planTarget, metadata } =
    params;

  const event = await prisma.conversionEvent.create({
    data: {
      userId,
      sessionId,
      eventType,
      eventSource,
      planTarget,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  });

  return event.id;
}

/**
 * Track when an upgrade prompt is shown
 */
export async function trackUpgradePromptShown(params: {
  userId?: string;
  sessionId?: string;
  source: EventSource;
  targetPlan: PlanType;
  reason?: string;
  metadata?: ConversionEventMetadata;
}): Promise<void> {
  await trackConversionEvent({
    userId: params.userId,
    sessionId: params.sessionId,
    eventType: CONVERSION_EVENT_TYPES.UPGRADE_PROMPT_SHOWN,
    eventSource: params.source,
    planTarget: params.targetPlan,
    metadata: {
      ...params.metadata,
      reason: params.reason,
    },
  });
}

/**
 * Track when a user clicks an upgrade button
 */
export async function trackUpgradeClick(params: {
  userId?: string;
  sessionId?: string;
  source: EventSource;
  targetPlan: PlanType;
  metadata?: ConversionEventMetadata;
}): Promise<void> {
  await trackConversionEvent({
    userId: params.userId,
    sessionId: params.sessionId,
    eventType: CONVERSION_EVENT_TYPES.UPGRADE_PROMPT_CLICKED,
    eventSource: params.source,
    planTarget: params.targetPlan,
    metadata: params.metadata,
  });
}

/**
 * Track when a feature gate blocks access
 */
export async function trackFeatureGateHit(params: {
  userId?: string;
  sessionId?: string;
  featureName: string;
  requiredPlan: PlanType;
  userPlan: PlanType;
  metadata?: ConversionEventMetadata;
}): Promise<void> {
  await trackConversionEvent({
    userId: params.userId,
    sessionId: params.sessionId,
    eventType: CONVERSION_EVENT_TYPES.FEATURE_GATE_HIT,
    eventSource: EVENT_SOURCES.FEATURE_GATE,
    planTarget: params.requiredPlan,
    metadata: {
      ...params.metadata,
      featureName: params.featureName,
      userPlan: params.userPlan,
    },
  });
}

/**
 * Track when a usage limit warning is shown
 */
export async function trackLimitWarning(params: {
  userId: string;
  limitType: string;
  currentUsage: number;
  limit: number;
  percentage: number;
  metadata?: ConversionEventMetadata;
}): Promise<void> {
  await trackConversionEvent({
    userId: params.userId,
    eventType: CONVERSION_EVENT_TYPES.LIMIT_WARNING_SHOWN,
    eventSource: EVENT_SOURCES.LIMIT_BANNER,
    metadata: {
      ...params.metadata,
      limitType: params.limitType,
      currentUsage: params.currentUsage,
      limitValue: params.limit,
      usagePercentage: params.percentage,
    },
  });
}

/**
 * Track when a trial is started
 */
export async function trackTrialStarted(params: {
  userId: string;
  source: EventSource;
  metadata?: ConversionEventMetadata;
}): Promise<void> {
  await trackConversionEvent({
    userId: params.userId,
    eventType: CONVERSION_EVENT_TYPES.TRIAL_STARTED,
    eventSource: params.source,
    planTarget: "premium",
    metadata: params.metadata,
  });
}

/**
 * Track when a trial converts to paid
 */
export async function trackTrialConverted(params: {
  userId: string;
  convertedPlan: PlanType;
  trialDaysUsed: number;
  metadata?: ConversionEventMetadata;
}): Promise<void> {
  await trackConversionEvent({
    userId: params.userId,
    eventType: CONVERSION_EVENT_TYPES.TRIAL_CONVERTED,
    planTarget: params.convertedPlan,
    metadata: {
      ...params.metadata,
      daysInTrial: params.trialDaysUsed,
    },
  });
}

/**
 * Get conversion funnel metrics
 */
export async function getConversionMetrics(params: {
  startDate: Date;
  endDate: Date;
  source?: EventSource;
}): Promise<{
  promptsShown: number;
  promptsClicked: number;
  checkoutsStarted: number;
  checkoutsCompleted: number;
  conversionRate: number;
  promptToClickRate: number;
  clickToCheckoutRate: number;
  checkoutCompletionRate: number;
}> {
  const { startDate, endDate, source } = params;

  const whereClause = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
    ...(source && { eventSource: source }),
  };

  const [promptsShown, promptsClicked, checkoutsStarted, checkoutsCompleted] =
    await Promise.all([
      prisma.conversionEvent.count({
        where: {
          ...whereClause,
          eventType: CONVERSION_EVENT_TYPES.UPGRADE_PROMPT_SHOWN,
        },
      }),
      prisma.conversionEvent.count({
        where: {
          ...whereClause,
          eventType: CONVERSION_EVENT_TYPES.UPGRADE_PROMPT_CLICKED,
        },
      }),
      prisma.conversionEvent.count({
        where: {
          ...whereClause,
          eventType: CONVERSION_EVENT_TYPES.CHECKOUT_STARTED,
        },
      }),
      prisma.conversionEvent.count({
        where: {
          ...whereClause,
          eventType: CONVERSION_EVENT_TYPES.CHECKOUT_COMPLETED,
        },
      }),
    ]);

  const promptToClickRate =
    promptsShown > 0 ? (promptsClicked / promptsShown) * 100 : 0;
  const clickToCheckoutRate =
    promptsClicked > 0 ? (checkoutsStarted / promptsClicked) * 100 : 0;
  const checkoutCompletionRate =
    checkoutsStarted > 0 ? (checkoutsCompleted / checkoutsStarted) * 100 : 0;
  const conversionRate =
    promptsShown > 0 ? (checkoutsCompleted / promptsShown) * 100 : 0;

  return {
    promptsShown,
    promptsClicked,
    checkoutsStarted,
    checkoutsCompleted,
    conversionRate: Math.round(conversionRate * 100) / 100,
    promptToClickRate: Math.round(promptToClickRate * 100) / 100,
    clickToCheckoutRate: Math.round(clickToCheckoutRate * 100) / 100,
    checkoutCompletionRate: Math.round(checkoutCompletionRate * 100) / 100,
  };
}

/**
 * Get trial conversion metrics
 */
export async function getTrialMetrics(params: {
  startDate: Date;
  endDate: Date;
}): Promise<{
  trialsStarted: number;
  trialsConverted: number;
  trialsExpired: number;
  conversionRate: number;
}> {
  const { startDate, endDate } = params;

  const whereClause = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  const [trialsStarted, trialsConverted, trialsExpired] = await Promise.all([
    prisma.conversionEvent.count({
      where: {
        ...whereClause,
        eventType: CONVERSION_EVENT_TYPES.TRIAL_STARTED,
      },
    }),
    prisma.conversionEvent.count({
      where: {
        ...whereClause,
        eventType: CONVERSION_EVENT_TYPES.TRIAL_CONVERTED,
      },
    }),
    prisma.conversionEvent.count({
      where: {
        ...whereClause,
        eventType: CONVERSION_EVENT_TYPES.TRIAL_EXPIRED,
      },
    }),
  ]);

  const conversionRate =
    trialsStarted > 0 ? (trialsConverted / trialsStarted) * 100 : 0;

  return {
    trialsStarted,
    trialsConverted,
    trialsExpired,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
}

/**
 * Get events for a specific user
 */
export async function getUserConversionEvents(
  userId: string,
  limit: number = 50,
): Promise<
  Array<{
    id: string;
    eventType: string;
    eventSource: string | null;
    planTarget: string | null;
    createdAt: Date;
    metadata: Record<string, unknown> | null;
  }>
> {
  const events = await prisma.conversionEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      eventType: true,
      eventSource: true,
      planTarget: true,
      createdAt: true,
      metadata: true,
    },
  });

  return events.map(
    (e: {
      id: string;
      eventType: string;
      eventSource: string | null;
      planTarget: string | null;
      createdAt: Date;
      metadata: unknown;
    }) => ({
      ...e,
      metadata: e.metadata as Record<string, unknown> | null,
    }),
  );
}

/**
 * Export conversion events for analysis
 */
export async function exportConversionEvents(params: {
  startDate: Date;
  endDate: Date;
  eventTypes?: ConversionEventType[];
}): Promise<
  Array<{
    id: string;
    userId: string | null;
    sessionId: string | null;
    eventType: string;
    eventSource: string | null;
    planTarget: string | null;
    createdAt: Date;
    metadata: Record<string, unknown> | null;
  }>
> {
  const { startDate, endDate, eventTypes } = params;

  const events = await prisma.conversionEvent.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      ...(eventTypes && { eventType: { in: eventTypes } }),
    },
    orderBy: { createdAt: "asc" },
  });

  return events.map(
    (e: {
      id: string;
      userId: string | null;
      sessionId: string | null;
      eventType: string;
      eventSource: string | null;
      planTarget: string | null;
      createdAt: Date;
      metadata: unknown;
    }) => ({
      ...e,
      metadata: e.metadata as Record<string, unknown> | null,
    }),
  );
}
