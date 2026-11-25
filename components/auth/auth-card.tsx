"use client";

import {
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Page shell shared by the sign-in, sign-up and recovery pages. */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-14">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h1>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && (
          <CardFooter className="text-sm text-muted-foreground">
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export function Field({
  label,
  ...props
}: { label: string; name: string } & ComponentProps<typeof Input>) {
  const id = `field-${props.name}`;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}

export function FormMessage({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (error) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (success) {
    return (
      <Alert role="status">
        <AlertDescription>{success}</AlertDescription>
      </Alert>
    );
  }
  return null;
}

const noopSubscribe = () => () => {};

/**
 * Submit button that stays disabled until React has hydrated. Before that the
 * form has no submit handler, and a native submit would send the fields to
 * the page URL instead of to Better Auth.
 */
export function SubmitButton({
  pending,
  children,
  ...props
}: { pending: boolean } & ComponentProps<typeof Button>) {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return (
    <Button type="submit" disabled={!hydrated || pending} {...props}>
      {children}
    </Button>
  );
}
