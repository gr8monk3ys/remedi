import type { Metadata } from "next";
import { InteractionChecker } from "@/components/interactions/InteractionChecker";

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
    <div className="min-h-screen px-4 pt-24 pb-16 md:px-8 lg:px-16">
      <div className="mx-auto max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Drug Interaction Checker
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Check for potential interactions between the medications,
            supplements, and natural remedies you take. Add each substance below
            and we will check all possible pairs for known interactions.
          </p>
        </div>

        {/* Interaction Checker Component */}
        <InteractionChecker />
      </div>
    </div>
  );
}
