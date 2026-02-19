import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-contributions");

const contributionSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be at most 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be at most 5000 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be at most 100 characters"),
  ingredients: z
    .array(
      z.string().max(200, "Ingredient name must be at most 200 characters"),
    )
    .min(1, "At least one ingredient is required")
    .max(50, "Too many ingredients listed"),
  benefits: z
    .array(
      z.string().max(500, "Benefit description must be at most 500 characters"),
    )
    .min(1, "At least one benefit is required")
    .max(20, "Too many benefits listed"),
  usage: z
    .string()
    .max(2000, "Usage must be at most 2000 characters")
    .optional(),
  dosage: z
    .string()
    .max(1000, "Dosage must be at most 1000 characters")
    .optional(),
  precautions: z
    .string()
    .max(2000, "Precautions must be at most 2000 characters")
    .optional(),
  scientificInfo: z
    .string()
    .max(5000, "Scientific info must be at most 5000 characters")
    .optional(),
  references: z
    .array(
      z.object({
        title: z
          .string()
          .max(300, "Reference title must be at most 300 characters"),
        url: z
          .string()
          .url("Must be a valid URL")
          .max(2048, "URL must be at most 2048 characters")
          .refine(
            (url) => url.startsWith("https://"),
            "Reference URLs must use HTTPS",
          )
          .optional(),
      }),
    )
    .max(20, "Too many references listed")
    .optional(),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .max(2048, "URL must be at most 2048 characters")
    .refine((url) => url.startsWith("https://"), "Image URL must use HTTPS")
    .optional(),
});

// GET /api/contributions - Get user's contributions
export async function GET(request: NextRequest) {
  // Check rate limit
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.contributions,
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
          error: { code: "UNAUTHORIZED", message: "You must be signed in" },
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10"), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const validStatuses = ["pending", "approved", "rejected"] as const;
    const typedStatus = validStatuses.find((s) => s === status);

    const where = {
      userId: user.id,
      ...(typedStatus && { status: typedStatus }),
    };

    const [contributions, total] = await Promise.all([
      prisma.remedyContribution.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.remedyContribution.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        contributions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching contributions", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch contributions",
        },
      },
      { status: 500 },
    );
  }
}

// POST /api/contributions - Create a new contribution
export async function POST(request: NextRequest) {
  // Check rate limit
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.contributions,
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
            message: "You must be signed in to contribute a remedy",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = contributionSchema.safeParse(body);

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

    const {
      name,
      description,
      category,
      ingredients,
      benefits,
      usage,
      dosage,
      precautions,
      scientificInfo,
      references,
      imageUrl,
    } = parsed.data;

    const referenceList = references?.map((ref) =>
      ref.url ? `${ref.title} (${ref.url})` : ref.title,
    );

    const contribution = await prisma.remedyContribution.create({
      data: {
        userId: user.id,
        name,
        description,
        category,
        ingredients,
        benefits,
        usage,
        dosage,
        precautions,
        scientificInfo,
        references: referenceList ?? [],
        imageUrl,
        status: "pending",
      },
    });

    return NextResponse.json(
      { success: true, data: contribution },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Error creating contribution", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create contribution",
        },
      },
      { status: 500 },
    );
  }
}
