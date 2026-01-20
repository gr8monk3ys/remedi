"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { LogOut, Settings, Heart, Shield } from "lucide-react";
import type { Session } from "next-auth";
import Link from "next/link";

interface UserMenuProps {
  session: Session;
  className?: string;
}

/**
 * User menu dropdown shown when user is authenticated
 * Displays user info and sign-out option
 */
export function UserMenu({ session, className = "" }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session.user;
  const displayName = user?.name || user?.email || "User";
  const userInitial = displayName.charAt(0).toUpperCase();
  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator" || isAdmin;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          hover:bg-gray-100 dark:hover:bg-zinc-800
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          dark:focus:ring-offset-zinc-900
        "
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt={displayName}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
            {userInitial}
          </div>
        )}
        <span className="text-sm font-medium hidden sm:inline">
          {displayName}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute right-0 mt-2 w-56 rounded-lg shadow-lg
            bg-white dark:bg-zinc-800
            border border-gray-200 dark:border-zinc-700
            py-1 z-50
          "
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {displayName}
            </p>
            {user?.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            )}
            {(isAdmin || isModerator) && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full capitalize">
                {user?.role}
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/favorites"
              className="
                flex items-center gap-3 px-4 py-2 text-sm
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-zinc-700
                transition-colors duration-150
              "
              onClick={() => setIsOpen(false)}
            >
              <Heart className="w-4 h-4" />
              <span>My Favorites</span>
            </Link>

            <Link
              href="/settings"
              className="
                flex items-center gap-3 px-4 py-2 text-sm
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-zinc-700
                transition-colors duration-150
              "
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            {/* Admin Link */}
            {isModerator && (
              <Link
                href="/admin"
                className="
                  flex items-center gap-3 px-4 py-2 text-sm
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-zinc-700
                  transition-colors duration-150
                "
                onClick={() => setIsOpen(false)}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Sign Out Section */}
          <div className="border-t border-gray-200 dark:border-zinc-700 py-1">
            <button
              onClick={handleSignOut}
              className="
                flex items-center gap-3 w-full px-4 py-2 text-sm text-left
                text-red-600 dark:text-red-400
                hover:bg-gray-100 dark:hover:bg-zinc-700
                transition-colors duration-150
              "
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
