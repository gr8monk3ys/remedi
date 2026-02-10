/**
 * Weekly Digest Cron Route
 *
 * Sends personalized weekly digest emails to all opted-in users.
 * Protected by CRON_SECRET header check.
 *
 * Trigger: Vercel Cron — every Monday at 9:00 AM UTC
 * GET /api/cron/weekly-digest
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { createLogger } from "@/lib/logger";
import { sendWeeklyDigest, sendBatchEmails } from "@/lib/email";
import {
  buildDigestData,
  fetchSharedDigestData,
} from "@/lib/email/digest-builder";
import type { PlanType } from "@/lib/stripe-config";

const log = createLogger("cron:weekly-digest");

const BATCH_SIZE = 10;

/**
 * Processes items in sequential batches with a concurrency limit per batch.
 */
async function processBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

export async function GET(request: Request): Promise<NextResponse> {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    log.info("Starting weekly digest cron job");

    // Find all users who have opted into weekly digest
    const users = await prisma.user.findMany({
      where: {
        emailPreferences: {
          weeklyDigest: true,
        },
      },
      select: {
        id: true,
        email: true,
        subscription: {
          select: { plan: true, status: true },
        },
      },
    });

    if (users.length === 0) {
      log.info("No users opted into weekly digest");
      return NextResponse.json({ sent: 0, failed: 0 });
    }

    log.info(`Building digests for ${users.length} users`);

    // Pre-fetch shared data once (new remedies + trending searches)
    // to avoid redundant identical queries per user
    const sharedData = await fetchSharedDigestData();

    // Build email sending functions in batches to limit concurrency
    const emailFns = await processBatches(users, BATCH_SIZE, async (user) => {
      const plan = (
        user.subscription?.status === "active" ? user.subscription.plan : "free"
      ) as PlanType;
      const digestData = await buildDigestData(user.id, plan, sharedData);

      if (!digestData) return null;

      return () => sendWeeklyDigest(user.email, digestData, user.id);
    });

    // Filter out nulls
    const validFns = emailFns.filter(
      (fn): fn is () => ReturnType<typeof sendWeeklyDigest> => fn !== null,
    );

    // Send batch with 100ms delay between each
    const results = await sendBatchEmails(validFns, 100);

    log.info("Weekly digest cron complete", {
      totalUsers: users.length,
      sent: results.sent,
      failed: results.failed,
    });

    return NextResponse.json({
      sent: results.sent,
      failed: results.failed,
      total: users.length,
    });
  } catch (error) {
    log.error("Weekly digest cron failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
