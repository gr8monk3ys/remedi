import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReportById } from "@/lib/db";
import { ReportViewer } from "@/components/reports/ReportViewer";

export const metadata = {
  title: "View Report | Remedi Dashboard",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const report = await getReportById(id);
  if (!report || report.userId !== user.id) {
    redirect("/dashboard/reports");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{report.title}</h1>
        <p className="text-muted-foreground mt-1">
          Generated {new Date(report.createdAt).toLocaleDateString()}
        </p>
      </div>

      <ReportViewer report={report} />
    </div>
  );
}
