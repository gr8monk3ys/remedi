import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { trackUserEventSafe } from "@/lib/analytics/user-events";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const reviewSchema = z.object({
  remedyId: z.string().min(1, "Remedy ID is required"),
  remedyName: z.string().min(1, "Remedy name is required"),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

const reviewsQuerySchema = z.object({
  remedyId: z.string().min(1, "Remedy ID is required"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

// GET /api/reviews - Get reviews for a remedy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate and sanitize query parameters with Zod
    const parsed = reviewsQuerySchema.safeParse({
      remedyId: searchParams.get("remedyId"),
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const { remedyId, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.remedyReview.findMany({
        where: { remedyId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.remedyReview.count({ where: { remedyId } }),
    ]);

    // Calculate average rating
    const aggregation = await prisma.remedyReview.aggregate({
      where: { remedyId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        averageRating: aggregation._avg.rating || 0,
        totalReviews: aggregation._count.rating,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch reviews" },
      },
      { status: 500 },
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  // Check rate limit
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.reviews,
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to write a review",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const { remedyId, remedyName, rating, title, comment } = parsed.data;

    // Check if user already reviewed this remedy
    const existingReview = await prisma.remedyReview.findFirst({
      where: {
        remedyId,
        userId: user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_REVIEW",
            message: "You have already reviewed this remedy",
          },
        },
        { status: 400 },
      );
    }

    const review = await prisma.remedyReview.create({
      data: {
        remedyId,
        remedyName,
        rating,
        title,
        comment,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    await trackUserEventSafe({
      request,
      userId: user.id,
      eventType: "review_submitted",
      eventData: {
        remedyId,
        rating,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create review" },
      },
      { status: 500 },
    );
  }
}
