import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Small mono label rendered above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional back link rendered above the eyebrow. */
  backHref?: string;
  backLabel?: string;
  /** Right-aligned actions (buttons, toggles). */
  actions?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * Shared page header: eyebrow, headline and a one-line description.
 *
 * Every public page used to hand-roll its own header with a different
 * size, weight and spacing; this keeps the rhythm identical across routes.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  align = "left",
  className,
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between",
        centered && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {backHref && (
          <Link
            href={backHref}
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1
          className={cn(
            "text-3xl font-semibold sm:text-4xl",
            eyebrow ? "mt-3" : "mt-0",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
