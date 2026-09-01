import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="px-4 pt-14 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Hero Skeleton */}
        <section className="pt-20 pb-10 text-center md:pt-28 md:pb-14">
          <Skeleton className="mx-auto h-4 w-56" />
          <Skeleton className="mx-auto mt-6 h-12 w-80" />
          <Skeleton className="mx-auto mt-3 h-12 w-64" />
          <Skeleton className="mx-auto mt-5 h-5 w-96 max-w-full" />
        </section>

        {/* Search Card Skeleton */}
        <section className="mx-auto w-full max-w-2xl pb-8">
          <div className="rounded-lg border border-border bg-card p-5 md:p-6">
            <Skeleton className="h-12 w-full" />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid Skeleton */}
        <section className="pt-12 pb-16">
          <div className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="mt-5 h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-3/4" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
