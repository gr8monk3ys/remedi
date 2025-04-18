/**
 * Loading skeleton for comparison
 */
export function ComparisonSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen">
      <div className="pt-24 pb-12 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl shadow-sm h-96 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
