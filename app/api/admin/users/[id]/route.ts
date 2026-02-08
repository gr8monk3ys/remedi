/**
 * Admin User API Route
 *
 * PATCH /api/admin/users/[id] - Update user (role, etc.)
 * DELETE /api/admin/users/[id] - Delete user
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  name: z.string().min(1).max(100).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    const userIsAdmin = await isAdmin();

    if (!currentUser || !userIsAdmin) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Admin access required"),
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse("INVALID_INPUT", validation.error.issues[0].message),
        { status: 400 },
      );
    }

    // Prevent self-demotion
    if (
      id === currentUser.id &&
      validation.data.role &&
      validation.data.role !== "admin"
    ) {
      return NextResponse.json(
        errorResponse("FORBIDDEN", "Cannot demote yourself"),
        { status: 403 },
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: validation.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(successResponse(user));
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to update user"),
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    const userIsAdmin = await isAdmin();

    if (!currentUser || !userIsAdmin) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "Admin access required"),
        { status: 403 },
      );
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === currentUser.id) {
      return NextResponse.json(
        errorResponse("FORBIDDEN", "Cannot delete yourself"),
        { status: 403 },
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      successResponse({ message: "User deleted successfully" }),
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to delete user"),
      { status: 500 },
    );
  }
}
