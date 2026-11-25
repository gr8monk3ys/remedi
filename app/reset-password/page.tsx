import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, FormMessage } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a New Password",
  robots: { index: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return (
    <AuthCard title="Choose a new password">
      {token && !error ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="grid gap-4">
          <FormMessage error="This reset link is invalid or has expired." />
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary/80"
          >
            Request a new link
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
