import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserReports } from "@/lib/db";
import { ReportsOverview } from "@/components/reports/ReportsOverview";

export const metadata = {
  title: "AI Reports | Remedi Dashboard",
  description: "AI-generated remedy reports tailored to your health profile",
};

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const result = await getUserReports(user.id, 1, 20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">AI Remedy Reports</h1>
        <p className="text-muted-foreground mt-1">
          Get personalized, AI-generated remedy analyses
        </p>
      </div>

      <ReportsOverview reports={result.reports} total={result.total} />
    </div>
  );
}
