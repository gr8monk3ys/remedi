import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileSettings } from "@/components/auth/profile-settings";

export const metadata: Metadata = {
  title: "Your Profile",
  description:
    "Manage your Remedi account details, security settings, and account deletion.",
};

export default async function UserProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/user-profile");

  return (
    <div className="min-h-screen px-4 pt-24 pb-16">
      <div className="mx-auto max-w-2xl">
        <ProfileSettings name={user.name} email={user.email} />
      </div>
    </div>
  );
}
