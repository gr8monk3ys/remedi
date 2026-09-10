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

        {/*
          Mirrors the "What a label is allowed to claim" <dl> in app/page.tsx,
          row for row. It used to be a three-across card grid, which stands in
          for nothing on that page and collapses on mobile to a much shorter
          block than the content it replaces.

          Measured honestly: this improves Cumulative Layout Shift on a local
          server, where CLS is 0.20-0.27. Production is already at 0.068 — well
          inside the 0.1 threshold — so treat this as a skeleton that now
          resembles what it stands in for, not as a fix for a production
          problem.
        */}
        <section className="pt-12 pb-16">
          <Skeleton className="h-4 w-56" />
          <div className="mt-4 divide-y divide-border border-y border-border">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <Skeleton className="h-4 w-32" />
                <div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
