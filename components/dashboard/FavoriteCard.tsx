"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MoreVertical,
  Trash2,
  Edit2,
  Share2,
  FolderPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { FavoriteItem } from "@/types/dashboard";

interface FavoriteCardProps {
  favorite: FavoriteItem;
  viewMode?: "grid" | "list";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  onMoveToCollection?: (id: string) => void;
  className?: string;
}

/**
 * Favorite Card Component
 *
 * Displays a favorited remedy with actions.
 */
export function FavoriteCard({
  favorite,
  viewMode = "grid",
  onEdit,
  onDelete,
  onShare,
  onMoveToCollection,
  className,
}: FavoriteCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleAction = (action: (() => void) | undefined): void => {
    if (action) {
      action();
    }
    setShowMenu(false);
  };

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-strong",
          className,
        )}
      >
        <div className="rounded-md bg-primary/10 p-2">
          <Heart className="h-4 w-4 text-primary" fill="currentColor" />
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={`/remedy/${favorite.remedyId}`}
            className="text-base font-medium text-foreground hover:text-primary transition-colors truncate block"
          >
            {favorite.remedyName}
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {favorite.collectionName && (
              <>
                <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                  {favorite.collectionName}
                </span>
                <span aria-hidden="true">-</span>
              </>
            )}
            <time dateTime={favorite.createdAt.toISOString()}>
              {formatDistanceToNow(favorite.createdAt, { addSuffix: true })}
            </time>
          </div>
        </div>

        {favorite.notes && (
          <p className="hidden md:block flex-1 text-sm text-muted-foreground truncate max-w-xs">
            {favorite.notes}
          </p>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="More actions"
            aria-expanded={showMenu}
          >
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          {showMenu && (
            <FavoriteActionsMenu
              onEdit={() => handleAction(() => onEdit?.(favorite.id))}
              onDelete={() => handleAction(() => onDelete?.(favorite.id))}
              onShare={() => handleAction(() => onShare?.(favorite.id))}
              onMoveToCollection={() =>
                handleAction(() => onMoveToCollection?.(favorite.id))
              }
              onClose={() => setShowMenu(false)}
            />
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={cn(
        "surface-hover rounded-lg border border-border bg-card p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="rounded-md bg-primary/10 p-2">
          <Heart className="h-4 w-4 text-primary" fill="currentColor" />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="More actions"
            aria-expanded={showMenu}
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          {showMenu && (
            <FavoriteActionsMenu
              onEdit={() => handleAction(() => onEdit?.(favorite.id))}
              onDelete={() => handleAction(() => onDelete?.(favorite.id))}
              onShare={() => handleAction(() => onShare?.(favorite.id))}
              onMoveToCollection={() =>
                handleAction(() => onMoveToCollection?.(favorite.id))
              }
              onClose={() => setShowMenu(false)}
            />
          )}
        </div>
      </div>

      <Link
        href={`/remedy/${favorite.remedyId}`}
        className="block text-lg font-semibold text-foreground hover:text-primary transition-colors truncate mb-2"
      >
        {favorite.remedyName}
      </Link>

      {favorite.collectionName && (
        <span className="mb-2 inline-block rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          {favorite.collectionName}
        </span>
      )}

      {favorite.notes && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {favorite.notes}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        <time dateTime={favorite.createdAt.toISOString()}>
          Saved {formatDistanceToNow(favorite.createdAt, { addSuffix: true })}
        </time>
      </p>
    </div>
  );
}

/**
 * Actions menu for favorite cards
 */
function FavoriteActionsMenu({
  onEdit,
  onDelete,
  onShare,
  onMoveToCollection,
  onClose,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onMoveToCollection: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute right-0 mt-1 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-20"
        role="menu"
      >
        <button
          onClick={onEdit}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
          role="menuitem"
        >
          <Edit2 className="h-4 w-4" />
          Edit Notes
        </button>
        <button
          onClick={onMoveToCollection}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
          role="menuitem"
        >
          <FolderPlus className="h-4 w-4" />
          Move to Collection
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
          role="menuitem"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <hr className="my-1 border-border" />
        <button
          onClick={onDelete}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-muted"
          role="menuitem"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </button>
      </div>
    </>
  );
}

/**
 * Skeleton loader for favorite cards
 */
export function FavoriteCardSkeleton({
  viewMode = "grid",
}: {
  viewMode?: "grid" | "list";
}) {
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border animate-pulse">
        <div className="h-9 w-9 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
        <div className="h-8 w-8 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-9 w-9 bg-muted rounded-lg" />
        <div className="h-6 w-6 bg-muted rounded" />
      </div>
      <div className="h-5 w-3/4 bg-muted rounded mb-2" />
      <div className="h-4 w-full bg-muted rounded mb-2" />
      <div className="h-4 w-2/3 bg-muted rounded mb-3" />
      <div className="h-3 w-24 bg-muted rounded" />
    </div>
  );
}
