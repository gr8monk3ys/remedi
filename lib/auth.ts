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
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const E2E_AUTH_COOKIE_NAMES = ["e2e_auth", "__session"] as const;
const E2E_LOCAL_USER_EMAIL = "e2e-user@remedi.local";
const E2E_LOCAL_USER_NAME = "E2E Local User";

function isE2ELocalAuthEnabled(): boolean {
  return process.env.E2E_LOCAL_AUTH === "true";
}

async function hasE2EAuthCookie(): Promise<boolean> {
  if (!isE2ELocalAuthEnabled()) return false;

  try {
    const cookieStore = await cookies();
    return E2E_AUTH_COOKIE_NAMES.some((name) =>
      Boolean(cookieStore.get(name)?.value),
    );
  } catch {
    return false;
  }
}

type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
};

async function getOrCreateE2ELocalUser(): Promise<AuthUser> {
  const existingUser = await prisma.user.findUnique({
    where: { email: E2E_LOCAL_USER_EMAIL },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (existingUser) return existingUser;

  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (firstUser) return firstUser;

  return prisma.user.create({
    data: {
      email: E2E_LOCAL_USER_EMAIL,
      name: E2E_LOCAL_USER_NAME,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });
}

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
  if (isE2ELocalAuthEnabled()) {
    const isAuthenticated = await hasE2EAuthCookie();
    if (!isAuthenticated) return null;
    return getOrCreateE2ELocalUser();
  }

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
  if (isE2ELocalAuthEnabled()) {
    return (await hasE2EAuthCookie()) ? "e2e-local-user" : null;
  }

  const { userId } = await auth();
  return userId;
}

/**
 * Check if the current request is authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  if (isE2ELocalAuthEnabled()) {
    return hasE2EAuthCookie();
  }

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
