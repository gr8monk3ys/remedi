import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-14">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card">
          <Search
            className="h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <p className="eyebrow eyebrow-muted">404</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">
          Page Not Found
        </h2>
        <p className="mt-3 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/faq">Visit the FAQ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
