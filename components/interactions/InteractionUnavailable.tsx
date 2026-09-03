"use client";

/**
 * The single rendering of "we could not check for interactions".
 *
 * Every interaction surface routes its `unknown` outcome through here, so the
 * wording that keeps a system failure from reading as a medical all-clear
 * lives in one place. Nothing in this component is ever green.
 */

import Link from "next/link";
import { AlertTriangle, Lock, LogIn, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { UnknownReason } from "@/lib/interactions/read";

interface InteractionUnavailableProps {
  reason: UnknownReason;
  message: string;
  retryAfter?: number;
  /** Names the thing that could not be checked, e.g. a remedy name. */
  subject?: string;
}

const NOT_A_CONFIRMATION =
  "This is not a confirmation that none exist. Talk to your healthcare provider or pharmacist before combining anything you take.";

export function InteractionUnavailable({
  reason,
  message,
  retryAfter,
  subject,
}: InteractionUnavailableProps): React.ReactElement {
  const about = subject ? ` with ${subject}` : "";

  const {
    icon: Icon,
    title,
    body,
    action,
  } = {
    "plan-required": {
      icon: Lock,
      title: "Interaction checking needs a paid plan",
      body: `${message} We have not checked${about}, so nothing here says your combination is safe.`,
      action: { href: "/pricing", label: "See plans" },
    },
    unauthenticated: {
      icon: LogIn,
      title: "Sign in to check interactions",
      body: `We could not check for interactions${about} because you are signed out. ${NOT_A_CONFIRMATION}`,
      action: { href: "/sign-in", label: "Sign in" },
    },
    "rate-limited": {
      icon: Timer,
      title: "Too many checks just now",
      body:
        `We could not check for interactions${about} because of too many recent requests` +
        (retryAfter ? `. Try again in about ${retryAfter} seconds. ` : ". ") +
        NOT_A_CONFIRMATION,
      action: null,
    },
    unavailable: {
      icon: AlertTriangle,
      title: "Interaction check unavailable",
      body: `We could not check for interactions${about} right now. ${NOT_A_CONFIRMATION}`,
      action: null,
    },
  }[reason];

  return (
    <Card className="border-amber-300 dark:border-amber-800">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <Icon
          className="h-8 w-8 text-amber-600 dark:text-amber-500"
          aria-hidden="true"
        />
        <h3 className="text-base font-medium">{title}</h3>
        <p className="max-w-md text-sm text-muted-foreground">{body}</p>
        {action && (
          <Link
            href={action.href}
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            {action.label}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
