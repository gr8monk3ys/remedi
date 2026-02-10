import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRemedyInsights, getJournalEntries } from "@/lib/db";
import { RemedyJournalDetail } from "@/components/journal/RemedyJournalDetail";

export const metadata = {
  title: "Remedy Details | Remedi Journal",
};

interface Props {
  params: Promise<{ remedyId: string }>;
}

export default async function RemedyJournalPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { remedyId } = await params;

  const [insights, entries] = await Promise.all([
    getRemedyInsights(user.id, remedyId),
    getJournalEntries(user.id, { remedyId, page: 1, pageSize: 50 }),
  ]);

  if (!insights) {
    redirect("/dashboard/journal");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{insights.remedyName}</h1>
        <p className="text-muted-foreground mt-1">
          {insights.totalEntries} entries logged &middot; Average rating{" "}
          {insights.avgRating}/5
        </p>
      </div>

      <RemedyJournalDetail insights={insights} entries={entries.entries} />
    </div>
  );
}
