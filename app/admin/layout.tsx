import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin, isModerator } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | Remedi",
  description: "Remedi administration panel",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const userIsAdmin = await isAdmin();
  const userIsModerator = await isModerator();

  // Redirect non-admin users
  if (!user || (!userIsAdmin && !userIsModerator)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex bg-muted">
      <AdminSidebar user={user} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
