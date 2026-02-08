/**
 * Admin Moderation API Route
 *
 * PATCH /api/admin/moderation/[id] - Approve/reject contribution or review
 *
 * On contribution approval/rejection, sends a notification email to the
 * contributing user via the email service.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin, isModerator } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { z } from "zod";
import {
  sendContributionApproved,
  sendContributionRejected,
} from "@/lib/email";
import { getEmailUrl } from "@/lib/email/config";

const moderationSchema = z.object({
  type: z.enum(["contribution", "review"]),
  action: z.enum(["approve", "reject"]),
  note: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    const userIsAdmin = await isAdmin();
    const userIsModerator = await isModerator();

    if (!currentUser || (!userIsAdmin && !userIsModerator)) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Moderator access required"),
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = moderationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse("INVALID_INPUT", validation.error.issues[0].message),
        { status: 400 },
      );
    }

    const { type, action, note } = validation.data;

    if (type === "contribution") {
      if (action === "approve") {
        // Get the contribution with its author
        const contribution = await prisma.remedyContribution.findUnique({
          where: { id },
          include: { user: { select: { id: true, email: true, name: true } } },
        });

        if (!contribution) {
          return NextResponse.json(
            errorResponse("RESOURCE_NOT_FOUND", "Contribution not found"),
            { status: 404 },
          );
        }

        // Create the natural remedy from the contribution
        const remedy = await prisma.naturalRemedy.create({
          data: {
            name: contribution.name,
            description: contribution.description,
            category: contribution.category,
            ingredients: contribution.ingredients,
            benefits: contribution.benefits,
            usage: contribution.usage,
            dosage: contribution.dosage,
            precautions: contribution.precautions,
            scientificInfo: contribution.scientificInfo,
            references: contribution.references,
            imageUrl: contribution.imageUrl,
            evidenceLevel: "Traditional", // Default for user contributions
          },
        });

        // Update contribution status
        await prisma.remedyContribution.update({
          where: { id },
          data: {
            status: "approved",
            moderatorNote: note,
            moderatedBy: currentUser.id,
            moderatedAt: new Date(),
          },
        });

        // Send approval notification email to the contributor
        try {
          await sendContributionApproved(
            contribution.user.email,
            {
              name: contribution.user.name || "there",
              remedyName: contribution.name,
              remedyUrl: getEmailUrl(`/remedy/${remedy.id}`),
            },
            contribution.user.id,
          );
        } catch (emailError) {
          // Non-critical: do not fail the moderation action if email fails
          console.error(
            "Failed to send contribution approval email:",
            emailError,
          );
        }

        return NextResponse.json(
          successResponse({
            message: "Contribution approved and remedy created",
          }),
        );
      } else {
        // Get the contribution with its author before rejecting
        const contribution = await prisma.remedyContribution.findUnique({
          where: { id },
          include: { user: { select: { id: true, email: true, name: true } } },
        });

        if (!contribution) {
          return NextResponse.json(
            errorResponse("RESOURCE_NOT_FOUND", "Contribution not found"),
            { status: 404 },
          );
        }

        // Reject
        await prisma.remedyContribution.update({
          where: { id },
          data: {
            status: "rejected",
            moderatorNote: note,
            moderatedBy: currentUser.id,
            moderatedAt: new Date(),
          },
        });

        // Send rejection notification email to the contributor
        try {
          await sendContributionRejected(
            contribution.user.email,
            {
              name: contribution.user.name || "there",
              remedyName: contribution.name,
              moderatorNote: note,
            },
            contribution.user.id,
          );
        } catch (emailError) {
          // Non-critical: do not fail the moderation action if email fails
          console.error(
            "Failed to send contribution rejection email:",
            emailError,
          );
        }

        return NextResponse.json(
          successResponse({ message: "Contribution rejected" }),
        );
      }
    } else if (type === "review") {
      if (action === "approve") {
        await prisma.remedyReview.update({
          where: { id },
          data: { verified: true },
        });

        return NextResponse.json(
          successResponse({ message: "Review verified" }),
        );
      } else {
        // Delete the review
        await prisma.remedyReview.delete({
          where: { id },
        });

        return NextResponse.json(
          successResponse({ message: "Review removed" }),
        );
      }
    }

    return NextResponse.json(errorResponse("INVALID_INPUT", "Invalid type"), {
      status: 400,
    });
  } catch (error) {
    console.error("Error processing moderation action:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to process moderation action"),
      { status: 500 },
    );
  }
}
