import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RemedyDetailLoading() {
  return (
    <div className="min-h-screen px-4 pt-24 pb-16 md:px-8 lg:px-16">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-4 w-96 max-w-full" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-2 w-24 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-16 rounded-md" />
              ))}
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 md:col-span-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                  <Skeleton className="mt-2 h-4 w-4/6" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
