/**
 * User Avatar Component
 *
 * Displays user avatar with fallback initials.
 */

import Image from "next/image";
import type { User } from "./types";

interface UserAvatarProps {
  user: User;
  size?: number;
}

export function UserAvatar({ user, size = 40 }: UserAvatarProps) {
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name || "User"}
        width={size}
        height={size}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-muted flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="text-muted-foreground font-medium">
        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
