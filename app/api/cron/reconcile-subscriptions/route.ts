/**
 * Re-read Stripe for subscriptions whose state we may have missed.
 *
 * Closing a webhook handler's bugs stops new drift; it does nothing about the
 * events that never arrived. The webhook returns 200 even when a handler
 * throws — deliberately, so Stripe does not retry forever — and records the
 * failure in WebhookEvent. Nothing read that table back, and no job compared a
 * subscription's period end against the clock.
 *
 * So one dropped `customer.subscription.deleted` left someone on a paid plan
 * permanently, with nothing to detect it. Entitlement is derived from
 * Subscription.status alone, and that row would say "active" forever.
 *
 * This is the reconciliation. Stripe is the source of truth; our row is a
 * cache, and this repairs the cache.
 *
 * GET /api/cron/reconcile-subscriptions          apply corrections
 * GET /api/cron/reconcile-subscriptions?dryRun=1 report only
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { authorizeCron } from "@/lib/cron-auth";
import {
  subscriptionStatusFor,
  ENTITLING_STATUSES,
} from "@/lib/subscription-status";
import { createLogger } from "@/lib/logger";

const log = createLogger("cron-reconcile-subscriptions");

/**
 * How far past its period end a subscription may sit before we suspect a
 * missed event.
 *
 * Stripe renews at the period boundary and sends the renewal asynchronously,
 * so a row is legitimately stale for a short while. Two days is comfortably
 * past that without letting a genuinely missed event run for a whole cycle.
 */
const GRACE_MS = 2 * 24 * 60 * 60 * 1000;

/** Cap the work one invocation will do, so this cannot run unbounded. */
const MAX_PER_RUN = 200;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const rejection = authorizeCron(request);
  if (rejection) {
    return NextResponse.json(
      { error: rejection.error },
      { status: rejection.status },
    );
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
  const cutoff = new Date(Date.now() - GRACE_MS);

  try {
    // Rows claiming entitlement while their paid period ended more than the
    // grace window ago. If Stripe still says active, the row is simply stale
    // and gets its dates refreshed; if not, we missed the event that would
    // have ended it.
    const suspect = await prisma.subscription.findMany({
      where: {
        status: { in: [...ENTITLING_STATUSES] },
        stripeSubscriptionId: { not: null },
        currentPeriodEnd: { lt: cutoff },
      },
      select: {
        id: true,
        userId: true,
        plan: true,
        status: true,
        stripeSubscriptionId: true,
        currentPeriodEnd: true,
      },
      take: MAX_PER_RUN,
      orderBy: { currentPeriodEnd: "asc" },
    });

    const stripe = getStripe();
    const corrected: Array<{ userId: string; from: string; to: string }> = [];
    const unreachable: string[] = [];

    for (const row of suspect) {
      if (!row.stripeSubscriptionId) continue;

      let live;
      try {
        live = await stripe.subscriptions.retrieve(row.stripeSubscriptionId);
      } catch (error) {
        // A subscription Stripe no longer knows about, or a transient API
        // failure. Either way we must not guess — leave the row and report it.
        unreachable.push(row.stripeSubscriptionId);
        log.warn("Could not read subscription from Stripe", {
          stripeSubscriptionId: row.stripeSubscriptionId,
          error,
        });
        continue;
      }

      const trueStatus = subscriptionStatusFor(live.status);
      const periodEndUnix = (
        live as unknown as { current_period_end?: number | null }
      ).current_period_end;
      const truePeriodEnd = periodEndUnix
        ? new Date(periodEndUnix * 1000)
        : null;

      const statusDiffers = trueStatus !== row.status;
      const periodMoved =
        truePeriodEnd !== null &&
        truePeriodEnd.getTime() !== row.currentPeriodEnd?.getTime();

      if (!statusDiffers && !periodMoved) continue;

      if (statusDiffers) {
        corrected.push({
          userId: row.userId,
          from: row.status,
          to: trueStatus,
        });
      }

      if (!dryRun) {
        await prisma.subscription.update({
          where: { id: row.id },
          data: {
            status: trueStatus,
            ...(truePeriodEnd && { currentPeriodEnd: truePeriodEnd }),
          },
        });
      }
    }

    // Surface handler failures. Nothing else reads this table, so a failed
    // event was invisible until now.
    const failedEvents = await prisma.webhookEvent.count({
      where: { status: "failed" },
    });

    const summary = {
      dryRun,
      inspected: suspect.length,
      corrected: corrected.length,
      unreachable: unreachable.length,
      failedWebhookEvents: failedEvents,
      // Capped: a summary is for alerting, not for dumping the customer list.
      corrections: corrected.slice(0, 20),
    };

    log[corrected.length > 0 || failedEvents > 0 ? "warn" : "info"](
      "Subscription reconciliation complete",
      summary,
    );

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    log.error("Subscription reconciliation failed", error);
    return NextResponse.json(
      { success: false, error: "Reconciliation failed" },
      { status: 500 },
    );
  }
}
