"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";

const SearchComponent = dynamic(
  () =>
    import("@/components/ui/search").then((mod) => ({
      default: mod.SearchComponent,
    })),
  {
    loading: () => (
      <div className="animate-pulse space-y-3">
        <div className="h-11 w-full rounded-lg bg-primary/10" />
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-primary/10" />
          ))}
        </div>
      </div>
    ),
    ssr: false,
  },
);

export function SearchSection() {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6 md:p-8">
        <SearchComponent />
      </CardContent>
    </Card>
  );
}
