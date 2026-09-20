import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-md border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 [&>svg]:size-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground [&>svg]:text-primary",
        warning:
          "border-warning/30 bg-warning/5 text-foreground [&>svg]:text-warning",
        destructive:
          "border-destructive/30 bg-destructive/5 text-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

type AlertTitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * The title of an Alert. Always a real heading — never a <div>.
 *
 * The heading role is load-bearing: the medical disclaimers are found by
 * `getByRole("heading", ...)` in e2e/remedy-detail*.spec.ts, and a health app
 * that hides its disclaimer from a screen reader's heading list is worse, not
 * better. An earlier attempt at the heading-order audit demoted this to a
 * <div> and had to be reverted.
 *
 * `level` picks which heading tag renders so each call site can slot the alert
 * into its page's outline — Lighthouse's `heading-order` audit fails when a
 * level is skipped (an h5 directly under an h2, say). It defaults to 5, the
 * tag this component used to hardcode, so an unannotated call site renders
 * exactly what it rendered before. Styling is identical at every level:
 * Tailwind's preflight resets heading font-size and weight to `inherit`, so
 * the classes below are the only thing sizing the title.
 */
const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { level?: AlertTitleLevel }
>(({ className, level = 5, ...props }, ref) => {
  const Heading = `h${level}` as const;

  return (
    <Heading
      ref={ref}
      className={cn(
        "mb-1 font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
});
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground [&_p]:leading-relaxed",
      className,
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
