"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function UserButton({ name, email }: { name: string; email: string }) {
  const initial = (name || email).charAt(0).toUpperCase();

  async function signOut() {
    await authClient.signOut();
    window.location.assign("/");
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/user-profile"
        aria-label="Your profile"
        title={email}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-sm font-medium hover:bg-muted"
      >
        {initial}
      </Link>
      <Button variant="ghost" size="sm" onClick={signOut}>
        Sign Out
      </Button>
    </div>
  );
}
