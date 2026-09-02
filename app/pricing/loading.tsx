import { Skeleton } from "@/components/ui/skeleton";

export default function PricingLoading() {
  return (
    <main className="px-4 pt-14 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Hero Section */}
        <section className="pt-20 pb-12 text-center md:pt-24">
          <Skeleton className="mx-auto h-4 w-20" />
          <Skeleton className="mx-auto mt-5 h-12 w-96 max-w-full" />
          <Skeleton className="mx-auto mt-4 h-6 w-80 max-w-full" />
          <Skeleton className="mx-auto mt-6 h-8 w-56 rounded-full" />
        </section>

        {/* Pricing Cards */}
        <section className="pb-16">
          <Skeleton className="mx-auto mb-10 h-11 w-56" />
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-6"
              >
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-5 h-10 w-28" />
                <Skeleton className="mt-6 h-9 w-full" />
                <div className="mt-6 space-y-3 border-t border-border pt-6">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-4xl">
            <Skeleton className="mx-auto h-8 w-56" />
            <div className="mt-10 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
