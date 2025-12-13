import { Metadata } from "next";
import { Leaf, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ContributionForm } from "@/components/remedy";

export const metadata: Metadata = {
  title: "Contribute a Remedy | Remedi",
  description:
    "Share your knowledge of natural remedies with the Remedi community. Submit a new remedy for review.",
};

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-muted py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Contribute a Remedy
              </h1>
              <p className="text-muted-foreground">
                Help grow our natural remedies database
              </p>
            </div>
          </div>

          <p className="text-muted-foreground">
            Share your knowledge of natural remedies with our community. All
            submissions are reviewed by our moderation team to ensure accuracy
            and safety before being published.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8">
          <ContributionForm />
        </div>
      </div>
    </div>
  );
}
