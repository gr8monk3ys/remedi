/**
 * Clerk Authentication Utilities
 *
 * Provides authentication helpers using Clerk.
 * Maintains the same exported function signatures as the previous NextAuth.js
 * implementation so all downstream imports continue to work unchanged.
 *
 * IMPORTANT: This module is server-only (uses Prisma and auth secrets).
 *
 * @see https://clerk.com/docs/references/nextjs/overview
 */

import "server-only";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Get current authenticated user from Clerk + DB.
 *
 * Returns a user object with shape compatible with the old NextAuth getCurrentUser():
 * { id, name, email, image, role }
 *
 * Returns null if not authenticated or if no DB user record exists.
 */
export async function getCurrentUser(): Promise<{
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
} | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  return dbUser || null;
}

/**
 * Get the Clerk user ID directly (fast, no DB call).
 * Returns null if not authenticated.
 */
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Check if the current request is authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

/**
 * Check if the current user has one of the specified roles.
 * Reads from the database User.role field.
 */
export async function checkUserRole(allowedRoles: string[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user?.role) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Check if the current user is an admin.
 */
export async function isAdmin(): Promise<boolean> {
  return checkUserRole(["admin"]);
}

/**
 * Check if the current user is a moderator or admin.
 */
export async function isModerator(): Promise<boolean> {
  return checkUserRole(["moderator", "admin"]);
}
