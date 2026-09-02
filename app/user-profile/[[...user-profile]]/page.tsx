import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile",
  description:
    "Manage your Remedi account details, security settings, and account deletion.",
};

export default function UserProfilePage() {
  return (
    <div className="min-h-screen px-4 pt-24 pb-16">
      <div className="mx-auto flex max-w-4xl justify-center">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-card border border-border shadow-none rounded-lg",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              formFieldLabel: "text-foreground",
              formFieldInput: "border-border bg-card text-foreground",
            },
          }}
        />
      </div>
    </div>
  );
}
