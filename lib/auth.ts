/**
 * Clerk Authentication Utilities
 *
 * Thin app-specific layer over `@gr8monk3ys/next-kit/auth/clerk`. The kit owns
 * the Clerk plumbing and the guard semantics; this module owns what is remedi's:
 * which columns make up a user, the E2E local-auth bypass, and the exported
 * function names.
 *
 * Maintains the same exported function signatures as the previous NextAuth.js
 * implementation so all downstream imports continue to work unchanged.
 *
 * IMPORTANT: This module is server-only (uses Prisma and auth secrets).
 *
 * @see https://clerk.com/docs/references/nextjs/overview
 */

import "server-only";
import {
  ForbiddenError,
  UnauthorizedError,
  authErrorResponse,
  createClerkAuth,
  setClerkModule,
} from "@gr8monk3ys/next-kit/auth/clerk";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

// Hand Clerk to the kit rather than letting it resolve `@clerk/nextjs/server`
// itself: this import is what next.config.ts swaps for the E2E mock, and a
// dynamic specifier inside the package would sidestep that alias.
setClerkModule({ auth });

const E2E_AUTH_COOKIE_NAMES = ["e2e_auth", "__session"] as const;
const E2E_LOCAL_USER_EMAIL = "e2e-user@remedi.local";
const E2E_LOCAL_USER_NAME = "E2E Local User";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
} as const;

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
    select: USER_SELECT,
  });

  if (existingUser) return existingUser;

  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: USER_SELECT,
  });

  if (firstUser) return firstUser;

  return prisma.user.upsert({
    where: { email: E2E_LOCAL_USER_EMAIL },
    update: { name: E2E_LOCAL_USER_NAME },
    create: {
      email: E2E_LOCAL_USER_EMAIL,
      name: E2E_LOCAL_USER_NAME,
    },
    select: USER_SELECT,
  });
}

const clerkAuth = createClerkAuth<AuthUser>({
  resolveUser: (clerkId) =>
    prisma.user.findUnique({ where: { clerkId }, select: USER_SELECT }),
  // Consulted before Clerk. When E2E local auth is off this is a no-op; when it
  // is on and no cookie is present we fall through to the aliased Clerk mock,
  // whose auth() reports no user — the same "signed out" answer.
  fallback: {
    enabled: isE2ELocalAuthEnabled,
    resolve: async () =>
      (await hasE2EAuthCookie()) ? getOrCreateE2ELocalUser() : null,
  },
});

/**
 * Get current authenticated user from Clerk + DB.
 *
 * Returns a user object with shape compatible with the old NextAuth getCurrentUser():
 * { id, name, email, image, role }
 *
 * Returns null if not authenticated or if no DB user record exists.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return clerkAuth.getUserOrNull();
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
  return clerkAuth.hasRole(allowedRoles);
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

/**
 * Guard an admin-only page.
 *
 * The /admin layout admits moderators too, so any segment that exposes
 * admin-only data (user PII, billing, analytics, production config) must
 * re-check here rather than relying on the layout.
 */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/moderation");
  }
}

/**
 * Require an authenticated user, or throw.
 *
 * The kit builds these alongside getUserOrNull, and this module previously
 * surfaced only the nullable variant — so all 33 route handlers hand-wrote
 * `if (!user) return 401` instead. Pair them with {@link authErrorResponse},
 * which maps UnauthorizedError to 401 and ForbiddenError to 403.
 */
export async function requireUser(): Promise<AuthUser> {
  return clerkAuth.requireUser();
}

/** Require one of these roles, or throw ForbiddenError. See {@link requireUser}. */
export async function requireRole(roles: string | string[]): Promise<AuthUser> {
  return clerkAuth.requireRole(roles);
}

export { authErrorResponse, ForbiddenError, UnauthorizedError };
