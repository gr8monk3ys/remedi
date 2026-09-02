"use client";

import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { useFavoritesQuery } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function FavoritesSection() {
  const { data: favorites = [], isLoading } = useFavoritesQuery();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="favorites-heading"
      className="rounded-lg border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <h2
          id="favorites-heading"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <Heart
            className="h-4 w-4 fill-primary text-primary"
            aria-hidden="true"
          />
          Your Favorites
        </h2>
        <Link
          href="/dashboard/favorites"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {favorites.map((favorite) => (
          <Link
            key={favorite.id}
            href={`/remedy/${favorite.remedyId}`}
            className="group flex items-center justify-between gap-3 rounded-md border border-border px-3.5 py-3 transition-colors hover:border-border-strong hover:bg-muted/60"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {favorite.remedyName}
              </p>
              {favorite.collectionName && (
                <Badge variant="secondary" className="mt-1">
                  {favorite.collectionName}
                </Badge>
              )}
            </div>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
