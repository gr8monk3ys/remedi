/**
 * Authentication helpers for server code.
 *
 * Reads the Better Auth session (lib/better-auth.ts) for the current request.
 * The session's user is the Prisma `User` row, so `user.id` is the database id.
 *
 * The throwing guards (`requireUser`, `requireRole`) are for route handlers:
 * pair them with {@link authErrorResponse}. In a Server Component use
 * `getCurrentUser()` and `redirect()` instead — an uncaught throw there renders
 * the error boundary, not a sign-in prompt.
 *
 * IMPORTANT: This module is server-only.
 */

import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/better-auth";

type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
};

/**
 * The signed-in user, or null.
 *
 * Wrapped in React.cache so a layout, its page and the role checks below
 * share one session lookup per server request. Outside a React server render
 * (route handlers, tests) the wrapper is a pass-through.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { id, name, email, image, role } = session.user;
  return { id, name, email, image: image ?? null, role: role ?? "user" };
});

/**
 * Check if the current request is authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}

/**
 * Check if the current user has one of the specified roles.
 * Reads from the database User.role field, via the cached current user.
 */
export async function checkUserRole(allowedRoles: string[]): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && allowedRoles.includes(user.role);
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

/** Thrown when no user is signed in. Carries HTTP 401. */
export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Thrown when a user is signed in but lacks the required role. Carries 403. */
export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Require an authenticated user, or throw {@link UnauthorizedError}. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Require one of these roles, or throw ForbiddenError. See {@link requireUser}. */
export async function requireRole(roles: string | string[]): Promise<AuthUser> {
  const user = await requireUser();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) {
    throw new ForbiddenError(`Requires one of: ${allowed.join(", ")}`);
  }
  return user;
}

/** Map an {@link UnauthorizedError} / {@link ForbiddenError} to a JSON response. */
export function authErrorResponse(error: unknown): Response | null {
  if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
    return new Response(
      JSON.stringify({ error: error.message, statusCode: error.status }),
      { status: error.status, headers: { "Content-Type": "application/json" } },
    );
  }
  return null;
}
