/**
 * Better Auth client for client components.
 *
 * `useAuthState()` is the one place components read signed-in state from.
 */

"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/better-auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export function useAuthState(): {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: (typeof authClient.$Infer.Session)["user"] | null;
} {
  const { data, isPending } = authClient.useSession();
  return {
    isLoaded: !isPending,
    isSignedIn: Boolean(data),
    user: data?.user ?? null,
  };
}
