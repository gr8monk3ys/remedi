import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const contributionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required"),
  benefits: z.array(z.string()).min(1, "At least one benefit is required"),
  usage: z.string().optional(),
  dosage: z.string().optional(),
  precautions: z.string().optional(),
  scientificInfo: z.string().optional(),
  references: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url().optional(),
      }),
    )
    .optional(),
  imageUrl: z.string().url().optional(),
});

// GET /api/contributions - Get user's contributions
export async function GET(request: NextRequest) {
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = {
      userId: user.id,
      ...(status && { status }),
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
    console.error("Error fetching contributions:", error);
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
    console.error("Error creating contribution:", error);
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
