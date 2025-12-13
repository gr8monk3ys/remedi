import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <main className="min-h-screen bg-muted py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="mx-auto h-9 w-56" />
          <Skeleton className="mx-auto mt-4 h-5 w-80" />
        </div>

        {/* Current Plan Banner */}
        <div className="mb-8 p-6 bg-card rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-32" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-md">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-10 w-28 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="mt-6 h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Skeleton className="mx-auto h-7 w-64 mb-6" />
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-lg p-6">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
