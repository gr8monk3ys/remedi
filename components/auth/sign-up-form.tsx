"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Field, FormMessage, SubmitButton } from "./auth-card";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    setPending(true);
    setError(null);

    const { error } = await authClient.signUp.email({
      name: String(form.get("name")),
      email,
      password: String(form.get("password")),
      callbackURL: "/verify-email",
    });

    setPending(false);
    if (error) {
      setError(error.message ?? "Sign up failed.");
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <FormMessage
        success={`Check ${sentTo} for a link to verify your email address, then sign in.`}
      />
    );
  }

  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-4">
      <FormMessage error={error} />
      <Field label="Name" name="name" autoComplete="name" required />
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
        autoComplete="new-password"
        minLength={8}
        required
      />
      <SubmitButton pending={pending}>
        {pending ? "Creating account…" : "Create Account"}
      </SubmitButton>
    </form>
  );
}
