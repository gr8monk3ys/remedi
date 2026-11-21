"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Field, FormMessage, SubmitButton } from "./auth-card";

export function ResendVerificationForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const { error } = await authClient.sendVerificationEmail({
      email: String(form.get("email")),
      callbackURL: "/verify-email",
    });

    setPending(false);
    if (error) {
      setError(error.message ?? "Could not send the verification email.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return <FormMessage success="A new verification link is on its way." />;
  }

  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-4">
      <FormMessage error={error} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <SubmitButton pending={pending}>
        {pending ? "Sending…" : "Resend Verification Email"}
      </SubmitButton>
    </form>
  );
}
