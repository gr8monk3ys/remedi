import { Skeleton } from "@/components/ui/skeleton";

export default function PricingLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-surface to-background">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Skeleton className="mx-auto h-12 w-96 max-w-full" />
          <Skeleton className="mx-auto mt-4 h-6 w-80 max-w-full" />
          <Skeleton className="mx-auto mt-8 h-9 w-64 rounded-full" />
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-8 shadow-md border border-border"
              >
                <Skeleton className="h-5 w-16 mb-2" />
                <Skeleton className="h-10 w-32 mb-1" />
                <Skeleton className="h-4 w-24 mb-6" />
                <Skeleton className="h-11 w-full rounded-lg mb-6" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="mx-auto h-8 w-56 mb-12" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
