import { Metadata } from "next";
import { ContributionForm } from "@/components/remedy";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Contribute a Remedy | Remedi",
  description:
    "Share your knowledge of natural remedies with the Remedi community. Submit a new remedy for review.",
};

export default function ContributePage() {
  return (
    <div className="px-4 pt-14 md:px-8">
      <div className="mx-auto max-w-3xl pt-12 pb-16">
        <PageHeader
          eyebrow="Community"
          title="Contribute a Remedy"
          description="Share your knowledge of natural remedies with our community. All submissions are reviewed by our moderation team to ensure accuracy and safety before being published."
          backHref="/"
          backLabel="Back to Home"
          className="mb-8"
        />

        {/* Form */}
        <div className="rounded-lg border border-border bg-card p-6 md:p-8">
          <ContributionForm />
        </div>
      </div>
    </div>
  );
}
