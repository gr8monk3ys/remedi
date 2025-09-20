import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { CONVERSION_EVENT_TYPES } from "@/lib/analytics/conversion-events";

function parseDate(value: string | null, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function safeRate(numerator: number, denominator: number): number {
  return denominator > 0
    ? Math.round((numerator / denominator) * 1000) / 10
    : 0;
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  const userIsAdmin = await isAdmin();

  if (!currentUser || !userIsAdmin) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Admin access required" },
      },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const end = parseDate(searchParams.get("end"), new Date());
  const start = parseDate(
    searchParams.get("start"),
    new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000),
  );

  const [
    landingViews,
    landingCtaClicks,
    pricingViews,
    pricingSelections,
    checkoutStarted,
    checkoutCompleted,
  ] = await Promise.all([
    prisma.userEvent.count({
      where: { createdAt: { gte: start, lte: end }, eventType: "landing_view" },
    }),
    prisma.userEvent.count({
      where: {
        createdAt: { gte: start, lte: end },
        eventType: "landing_cta_clicked",
      },
    }),
    prisma.conversionEvent.count({
      where: {
        createdAt: { gte: start, lte: end },
        eventType: CONVERSION_EVENT_TYPES.PRICING_PAGE_VIEWED,
      },
    }),
    prisma.conversionEvent.count({
      where: {
        createdAt: { gte: start, lte: end },
        eventType: CONVERSION_EVENT_TYPES.PRICING_PLAN_SELECTED,
      },
    }),
    prisma.conversionEvent.count({
      where: {
        createdAt: { gte: start, lte: end },
        eventType: CONVERSION_EVENT_TYPES.CHECKOUT_STARTED,
      },
    }),
    prisma.conversionEvent.count({
      where: {
        createdAt: { gte: start, lte: end },
        eventType: CONVERSION_EVENT_TYPES.CHECKOUT_COMPLETED,
      },
    }),
  ]);

  const rates = {
    ctaToPricing: safeRate(pricingViews, landingCtaClicks),
    pricingToCheckout: safeRate(checkoutStarted, pricingSelections),
    checkoutToPaid: safeRate(checkoutCompleted, checkoutStarted),
    landingToCheckout: safeRate(checkoutCompleted, landingViews),
  };

  const rows = [
    ["metric", "value"],
    ["start", start.toISOString()],
    ["end", end.toISOString()],
    ["landing_views", landingViews.toString()],
    ["landing_cta_clicks", landingCtaClicks.toString()],
    ["pricing_views", pricingViews.toString()],
    ["pricing_selections", pricingSelections.toString()],
    ["checkout_started", checkoutStarted.toString()],
    ["checkout_completed", checkoutCompleted.toString()],
    ["rate_cta_to_pricing", rates.ctaToPricing.toFixed(1)],
    ["rate_pricing_to_checkout", rates.pricingToCheckout.toFixed(1)],
    ["rate_checkout_to_paid", rates.checkoutToPaid.toFixed(1)],
    ["rate_landing_to_checkout", rates.landingToCheckout.toFixed(1)],
  ];

  const csv = rows.map((row) => row.join(",")).join("\n") + "\n";

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=remedi-funnel.csv",
    },
  });
}
