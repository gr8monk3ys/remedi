/**
 * Hook to access the database user ID from Clerk's publicMetadata.
 *
 * Clerk's user.id is a Clerk-specific ID (user_xxx).
 * The Prisma database uses its own UUID as the primary key.
 * During webhook sync, the Prisma UUID is stored in Clerk's
 * publicMetadata.dbUserId so client components can access it.
 */

"use client";

import { useUser } from "@clerk/nextjs";

interface DbUserInfo {
  /** The Prisma UUID for this user (not Clerk's ID) */
  dbUserId: string | undefined;
  /** The user's role from Clerk publicMetadata */
  role: string;
  /** Whether Clerk has finished loading user data */
  isLoaded: boolean;
  /** Whether the user is signed in */
  isSignedIn: boolean | undefined;
}

/**
 * Get the database user ID and role from Clerk's publicMetadata.
 * Use this in client components that need the Prisma user ID for API calls.
 */
export function useDbUser(): DbUserInfo {
  const { user, isLoaded, isSignedIn } = useUser();

  return {
    dbUserId: (user?.publicMetadata?.dbUserId as string) || undefined,
    role: (user?.publicMetadata?.role as string) || "user",
    isLoaded,
    isSignedIn,
  };
}
