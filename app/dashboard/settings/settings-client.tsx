"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Bell,
  Shield,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchWithCSRF } from "@/lib/fetch";

interface SettingsClientProps {
  userName: string | null;
  userEmail: string;
  emailPreferences: {
    weeklyDigest: boolean;
    marketingEmails: boolean;
    productUpdates: boolean;
    subscriptionReminders: boolean;
  };
}

type PreferenceKey = keyof SettingsClientProps["emailPreferences"];

interface NotificationToggle {
  key: PreferenceKey;
  label: string;
  description: string;
}

const NOTIFICATION_TOGGLES: NotificationToggle[] = [
  {
    key: "weeklyDigest",
    label: "Weekly Digest",
    description: "Receive a weekly summary of new remedies and your activity",
  },
  {
    key: "marketingEmails",
    label: "Marketing Emails",
    description: "Promotional offers and new feature announcements",
  },
  {
    key: "productUpdates",
    label: "Product Updates",
    description: "Updates about new features and improvements",
  },
  {
    key: "subscriptionReminders",
    label: "Subscription Reminders",
    description: "Billing and subscription status notifications",
  },
];

/**
 * Settings Client Component
 *
 * Handles client-side interactions for the settings page including
 * email preference toggles with optimistic updates.
 */
export function SettingsClient({
  userName,
  userEmail,
  emailPreferences,
}: SettingsClientProps): React.JSX.Element {
  const [preferences, setPreferences] = useState(emailPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );

  const handleToggle = useCallback(
    async (key: PreferenceKey, checked: boolean): Promise<void> => {
      const previousPreferences = { ...preferences };

      // Optimistic update
      setPreferences((prev) => ({ ...prev, [key]: checked }));
      setIsSaving(true);
      setSaveStatus("idle");

      try {
        const response = await fetchWithCSRF("/api/email-preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [key]: checked }),
        });

        if (!response.ok) {
          throw new Error("Failed to update preference");
        }

        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        // Revert on error
        setPreferences(previousPreferences);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } finally {
        setIsSaving(false);
      }
    },
    [preferences],
  );

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>
            Your account information and profile settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {userName ?? "Not set"}
            </p>
          </div>
          <div className="grid gap-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {userEmail}
            </p>
          </div>
          <Separator />
          <a
            href="/user-profile"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Manage Profile
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      {/* Email Notifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
            {isSaving && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Failed to save. Please try again.
              </span>
            )}
          </div>
          <CardDescription>
            Choose which email notifications you would like to receive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {NOTIFICATION_TOGGLES.map((toggle) => (
              <div
                key={toggle.key}
                className="flex items-center justify-between gap-4"
              >
                <div className="grid gap-1">
                  <Label
                    htmlFor={toggle.key}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {toggle.label}
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {toggle.description}
                  </p>
                </div>
                <Switch
                  id={toggle.key}
                  checked={preferences[toggle.key]}
                  onCheckedChange={(checked: boolean) =>
                    handleToggle(toggle.key, checked)
                  }
                  disabled={isSaving}
                  aria-label={`Toggle ${toggle.label}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <CardTitle>Data & Privacy</CardTitle>
          </div>
          <CardDescription>
            Manage your data, search history, and privacy settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="grid gap-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search History
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and manage your past searches.
              </p>
            </div>
            <Link
              href="/dashboard/history"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Manage History
            </Link>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="grid gap-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Export Data
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Download a copy of your data including search history,
                favorites, and preferences.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-500 shadow-sm cursor-not-allowed opacity-60"
            >
              Coming Soon
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-600 dark:text-red-400">
              Danger Zone
            </CardTitle>
          </div>
          <CardDescription>
            Irreversible actions that affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Delete Account
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <a
              href="/user-profile"
              className="inline-flex items-center gap-2 rounded-md border border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 whitespace-nowrap"
            >
              Delete Account
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
