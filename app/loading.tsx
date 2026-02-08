import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 pt-24 md:px-8 lg:px-16">
      {/* Hero Skeleton */}
      <section className="w-full max-w-3xl pt-8 pb-12 md:pt-16 md:pb-20 text-center">
        <Skeleton className="mx-auto h-6 w-48 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-12 w-80" />
        <Skeleton className="mx-auto mt-3 h-10 w-64" />
        <Skeleton className="mx-auto mt-4 h-5 w-96" />
      </section>

      {/* Search Card Skeleton */}
      <section className="w-full max-w-2xl pb-12">
        <div className="rounded-xl border-0 bg-card p-6 shadow-lg md:p-8">
          <Skeleton className="h-11 w-full rounded-lg" />
          <div className="mt-3 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Skeleton */}
      <section className="w-full max-w-3xl pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-5">
              <Skeleton className="mb-3 h-8 w-8 rounded-md" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-3/4" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
