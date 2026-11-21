"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Field, FormMessage, SubmitButton } from "./auth-card";

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    setNotice(null);

    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (error) {
      setPending(false);
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setNotice(
          "Your email is not verified yet. We sent you a new verification link.",
        );
        return;
      }
      setError(error.message ?? "Sign in failed.");
      return;
    }

    // A full navigation so server components render with the new session.
    window.location.assign(redirectTo);
  }

  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-4">
      <FormMessage error={error} success={notice} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <SubmitButton pending={pending}>
        {pending ? "Signing in…" : "Sign In"}
      </SubmitButton>
      <Link
        href="/forgot-password"
        className="text-sm text-primary hover:text-primary/80"
      >
        Forgot your password?
      </Link>
    </form>
  );
}
