import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEFAULT_EMAIL_PREFERENCES } from "@/lib/email/types";
import { SettingsClient } from "./settings-client";
import type { Metadata } from "next";
import type { EmailPreferences } from "@/lib/email/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings, email preferences, and privacy.",
};

/**
 * Settings Page
 *
 * Server component that fetches user data and email preferences,
 * then delegates rendering to the SettingsClient component.
 */
export default async function SettingsPage(): Promise<React.JSX.Element | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const emailPrefs = await prisma.emailPreference.findUnique({
    where: { userId: user.id },
    select: {
      weeklyDigest: true,
      marketingEmails: true,
      productUpdates: true,
      subscriptionReminders: true,
    },
  });

  const preferences: EmailPreferences = emailPrefs ?? {
    ...DEFAULT_EMAIL_PREFERENCES,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account preferences, notifications, and privacy settings.
        </p>
      </div>

      <SettingsClient
        userName={user.name}
        userEmail={user.email}
        emailPreferences={preferences}
      />
    </div>
  );
}
