"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Field, FormMessage, SubmitButton } from "./auth-card";

type Result = { error?: string; success?: string };

/**
 * One card with one form. `action` returns what to show under it; the form
 * resets after a success so passwords do not linger in the inputs.
 */
function SettingsForm({
  title,
  description,
  submitLabel,
  destructive,
  action,
  children,
}: {
  title: string;
  description: string;
  submitLabel: string;
  destructive?: boolean;
  action: (form: FormData) => Promise<Result>;
  children: ReactNode;
}) {
  const [result, setResult] = useState<Result>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    setResult({});
    const next = await action(new FormData(formElement));
    setPending(false);
    setResult(next);
    if (next.success) formElement.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form method="post" onSubmit={onSubmit} className="grid gap-4">
          <FormMessage error={result.error} success={result.success} />
          {children}
          <SubmitButton
            pending={pending}
            variant={destructive ? "destructive" : "default"}
            className="justify-self-start"
          >
            {submitLabel}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

const field = (form: FormData, name: string): string => String(form.get(name));

export function ProfileSettings({
  name,
  email,
}: {
  name: string | null;
  email: string;
}) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    window.location.assign("/");
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your Profile
          </h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </div>

      <SettingsForm
        title="Name"
        description="How Remedi addresses you."
        submitLabel="Save Name"
        action={async (form) => {
          const { error } = await authClient.updateUser({
            name: field(form, "name"),
          });
          if (error) return { error: error.message ?? "Could not save." };
          router.refresh();
          return { success: "Name saved." };
        }}
      >
        <Field
          label="Name"
          name="name"
          defaultValue={name ?? ""}
          autoComplete="name"
          required
        />
      </SettingsForm>

      <SettingsForm
        title="Email"
        description="We send a verification link to the new address. The change applies once you open it."
        submitLabel="Change Email"
        action={async (form) => {
          const newEmail = field(form, "newEmail");
          const { error } = await authClient.changeEmail({
            newEmail,
            callbackURL: "/user-profile",
          });
          if (error)
            return { error: error.message ?? "Could not change email." };
          return { success: `Check ${newEmail} for a verification link.` };
        }}
      >
        <Field
          label="New email"
          name="newEmail"
          type="email"
          autoComplete="email"
          required
        />
      </SettingsForm>

      <SettingsForm
        title="Password"
        description="Changing your password signs you out everywhere else."
        submitLabel="Change Password"
        action={async (form) => {
          const { error } = await authClient.changePassword({
            currentPassword: field(form, "currentPassword"),
            newPassword: field(form, "newPassword"),
            revokeOtherSessions: true,
          });
          if (error)
            return { error: error.message ?? "Could not change password." };
          return { success: "Password changed." };
        }}
      >
        <Field
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <Field
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </SettingsForm>

      <SettingsForm
        title="Delete Account"
        description="Permanently delete your account and all associated data, and cancel any subscription. This cannot be undone."
        submitLabel="Delete Account"
        destructive
        action={async (form) => {
          const { error } = await authClient.deleteUser({
            password: field(form, "password"),
          });
          if (error)
            return { error: error.message ?? "Could not delete account." };
          window.location.assign("/");
          return { success: "Account deleted." };
        }}
      >
        <Field
          label="Confirm with your password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </SettingsForm>
    </div>
  );
}
