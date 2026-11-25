import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = pageMetadata({
  path: "/sign-in",
  title: "Sign In",
  description:
    "Sign in to your Remedi account to access saved remedies and personalized recommendations.",
});

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url } = await searchParams;

  return (
    <AuthCard
      title="Sign in to Remedi"
      footer={
        <span>
          No account?{" "}
          <Link href="/sign-up" className="text-primary hover:text-primary/80">
            Sign up
          </Link>
        </span>
      }
    >
      <SignInForm redirectTo={safeRedirectPath(redirect_url)} />
    </AuthCard>
  );
}
