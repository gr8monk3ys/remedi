import type { Metadata } from "next";
import { InteractionChecker } from "@/components/interactions/InteractionChecker";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Drug Interaction Checker",
  description:
    "Check for potential interactions between medications, supplements, and natural remedies. Find safety information about combining multiple substances.",
  openGraph: {
    title: "Drug Interaction Checker - Remedi",
    description:
      "Check for potential interactions between medications, supplements, and natural remedies.",
  },
};

export default function InteractionsPage(): React.ReactElement {
  return (
    <div className="px-4 pt-14 md:px-8">
      <div className="mx-auto max-w-3xl pt-12 pb-16">
        <PageHeader
          eyebrow="Safety"
          title="Drug Interaction Checker"
          description="Check for potential interactions between the medications, supplements, and natural remedies you take. Add each substance below and we will check all possible pairs for known interactions."
          className="mb-8"
        />

        {/* Interaction Checker Component */}
        <InteractionChecker />
      </div>
    </div>
  );
}
