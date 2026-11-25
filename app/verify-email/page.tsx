import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthCard, FormMessage } from "@/components/auth/auth-card";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Verify Your Email",
  robots: { index: false },
};

/**
 * The callback for verification links. A valid link signs the user in and
 * lands here; an invalid or expired one lands here with `?error=`.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = error ? null : await getCurrentUser();

  if (user) {
    return (
      <AuthCard title="Email verified">
        <div className="grid gap-4">
          <FormMessage success={`${user.email} is verified.`} />
          <Button asChild>
            <Link href="/">Continue</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verify your email"
      description="Enter your email to get a new verification link."
    >
      <div className="grid gap-4">
        {error && (
          <FormMessage error="That verification link is invalid or has expired." />
        )}
        <ResendVerificationForm />
      </div>
    </AuthCard>
  );
}
