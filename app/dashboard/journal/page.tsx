import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTrackedRemedies, getJournalEntries } from "@/lib/db";
import { JournalOverview } from "@/components/journal/JournalOverview";

export const metadata = {
  title: "Remedy Journal | Remedi Dashboard",
  description: "Track your remedy effectiveness over time",
};

export default async function JournalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [trackedRemedies, recentEntries] = await Promise.all([
    getTrackedRemedies(user.id),
    getJournalEntries(user.id, { page: 1, pageSize: 10 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Remedy Journal</h1>
        <p className="text-muted-foreground mt-1">
          Track how remedies work for you over time
        </p>
      </div>

      <JournalOverview
        trackedRemedies={trackedRemedies}
        recentEntries={recentEntries.entries}
        totalEntries={recentEntries.total}
      />
    </div>
  );
}
