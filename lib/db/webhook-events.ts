/**
 * Webhook Delivery Database Operations
 *
 * Records inbound webhook events in an at-least-once delivery log (the DLQ)
 * and tracks per-provider last-seen status for health checks.
 *
 * IMPORTANT: This module is server-only and cannot be imported in client components.
 */

import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./client";

/**
 * Record an attempt to process a webhook event, keyed by the provider's
 * event ID so replays are idempotent. Increments `attempts` on replay.
 */
export async function recordWebhookEventAttempt(event: {
  id: string;
  type: string;
  payload: unknown;
}) {
  return prisma.webhookEvent.upsert({
    where: { stripeEventId: event.id },
    create: {
      stripeEventId: event.id,
      type: event.type,
      payload: event.payload as Prisma.InputJsonValue,
      status: "pending",
      attempts: 1,
    },
    update: {
      // Increment attempts on each retry so we can see how many times the
      // provider (or our own replay logic) has attempted delivery.
      status: "pending",
      attempts: { increment: 1 },
      lastError: null,
    },
    select: { id: true, attempts: true },
  });
}

/** Mark a recorded webhook event as successfully processed. */
export async function markWebhookEventProcessed(id: string) {
  return prisma.webhookEvent.update({
    where: { id },
    data: { status: "processed", processedAt: new Date() },
  });
}

/** Mark a recorded webhook event as failed, storing the handler's error. */
export async function markWebhookEventFailed(id: string, lastError: string) {
  return prisma.webhookEvent.update({
    where: { id },
    data: { status: "failed", lastError },
  });
}

/**
 * Record the last time a webhook from `provider` was received, for the
 * lightweight webhook health check.
 */
export async function recordWebhookReceived(
  provider: string,
  eventType: string,
  eventId: string,
) {
  return prisma.webhookStatus.upsert({
    where: { provider },
    create: {
      provider,
      lastReceivedAt: new Date(),
      lastEventType: eventType,
      lastEventId: eventId,
    },
    update: {
      lastReceivedAt: new Date(),
      lastEventType: eventType,
      lastEventId: eventId,
    },
  });
}
