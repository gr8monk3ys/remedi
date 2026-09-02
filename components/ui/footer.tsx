import Link from "next/link";
import { Leaf } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/", label: "Search" },
      { href: "/interactions", label: "Interaction checker" },
      { href: "/compare", label: "Compare" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/contribute", label: "Contribute a remedy" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/disclaimer", label: "Medical Disclaimer" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card">
                <Leaf className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              </span>
              Remedi
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Maps pharmaceuticals to natural remedies and shows how strong the
              evidence behind each one is.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="eyebrow eyebrow-muted">{column.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Remedi. For informational purposes only, not medical advice.</p>
          <p className="font-mono">
            Data from OpenFDA and peer-reviewed research
          </p>
        </div>
      </div>
    </footer>
  );
}
