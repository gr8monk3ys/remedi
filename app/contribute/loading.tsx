import { Skeleton } from "@/components/ui/skeleton";

export default function ContributeLoading() {
  return (
    <div className="min-h-screen bg-muted py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-4 w-28 mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-56" />
              <Skeleton className="mt-1 h-4 w-72" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-3/4" />
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            ))}
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <Skeleton className="h-11 w-36 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
