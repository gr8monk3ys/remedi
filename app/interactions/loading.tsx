import { Skeleton } from "@/components/ui/skeleton";

export default function InteractionsLoading() {
  return (
    <div className="min-h-screen px-4 pt-24 pb-16 md:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="mt-2 h-5 w-full max-w-2xl" />
          <Skeleton className="mt-1 h-5 w-96 max-w-full" />
        </div>

        {/* Substance Input Area */}
        <div className="rounded-xl border bg-card p-6 shadow-sm mb-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-11 w-full rounded-lg mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-28 rounded-full" />
            ))}
          </div>
        </div>

        {/* Check Button */}
        <Skeleton className="h-11 w-48 rounded-lg mb-6" />

        {/* Results Placeholder */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-6">
              <Skeleton className="h-5 w-64 mb-3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
