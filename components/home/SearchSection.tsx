"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const SearchComponent = dynamic(
  () =>
    import("@/components/ui/search").then((mod) => ({
      default: mod.SearchComponent,
    })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>
    ),
    ssr: false,
  },
);

export function SearchSection() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 md:p-6">
      <SearchComponent />
    </div>
  );
}
