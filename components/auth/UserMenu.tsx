"use client";

import { UserButton } from "@clerk/nextjs";

interface UserMenuProps {
  className?: string;
}

/**
 * User menu - wraps Clerk's UserButton component
 */
export function UserMenu({ className = "" }: UserMenuProps) {
  return (
    <div className={className}>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
