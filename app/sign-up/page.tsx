import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = pageMetadata({
  path: "/sign-up",
  title: "Sign Up",
  description:
    "Create your Remedi account to save remedies and get personalized recommendations.",
});

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:text-primary/80">
            Sign in
          </Link>
        </span>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
