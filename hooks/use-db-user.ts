/**
 * The signed-in user's database id and role, for client components.
 *
 * The Better Auth session user is the Prisma `User` row, so its id is the
 * database id API calls expect.
 */

"use client";

import { useAuthState } from "@/lib/auth-client";

interface DbUserInfo {
  /** The Prisma UUID for this user */
  dbUserId: string | undefined;
  /** The user's role (User.role) */
  role: string;
  /** Whether the session has finished loading */
  isLoaded: boolean;
  /** Whether the user is signed in */
  isSignedIn: boolean;
}

export function useDbUser(): DbUserInfo {
  const { user, isLoaded, isSignedIn } = useAuthState();

  return {
    dbUserId: user?.id,
    role: user?.role ?? "user",
    isLoaded,
    isSignedIn,
  };
}
