import type { Metadata } from "next";
import {
  Database,
  Globe,
  Cpu,
  BookOpen,
  FlaskConical,
  Leaf,
  AlertTriangle,
} from "lucide-react";
import { EVIDENCE_LEVELS } from "@/lib/evidence-levels";
import { EvidenceBadge } from "@/components/remedy/EvidenceBadge";
import { PageHeader } from "@/components/ui/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "About | Remedi",
  description:
    "Learn how Remedi helps you discover evidence-based natural alternatives to pharmaceutical drugs and supplements.",
};

const SEARCH_STEPS = [
  {
    step: 1,
    icon: Database,
    title: "Database Search",
    description:
      "We first check our curated database of pharmaceuticals and natural remedy mappings.",
  },
  {
    step: 2,
    icon: Globe,
    title: "FDA API Integration",
    description:
      "If not found locally, we query the OpenFDA database for drug information.",
  },
  {
    step: 3,
    icon: Cpu,
    title: "Smart Matching",
    description:
      "Our algorithm maps pharmaceutical ingredients to natural alternatives using similarity scoring.",
  },
] as const;

const DATA_SOURCES = [
  { icon: Globe, label: "OpenFDA Drug Database" },
  { icon: FlaskConical, label: "Peer-reviewed research" },
  { icon: Leaf, label: "Traditional medicine references" },
  { icon: BookOpen, label: "Expert and community contributions" },
] as const;

function Section({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t border-border py-10 md:grid-cols-[220px_1fr] md:gap-10">
      <div>
        <p className="eyebrow eyebrow-muted">0{index}</p>
        <h2 className="mt-2 text-lg font-semibold">{title}</h2>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function AboutPage(): React.JSX.Element {
  return (
    <div className="px-4 pt-14 md:px-8">
      <div className="mx-auto max-w-4xl pt-12">
        <PageHeader
          eyebrow="About"
          title="About Remedi"
          description="Remedi maps pharmaceuticals to natural remedies and shows how strong the evidence behind each one is, so you can weigh your options before talking to your provider."
          backHref="/"
          backLabel="Back to Home"
        />

        <main className="pb-16">
          <Section index={1} title="Our Mission">
            <p className="text-base leading-relaxed text-muted-foreground">
              Remedi helps you discover evidence-based natural alternatives to
              pharmaceutical drugs and supplements. We believe everyone deserves
              clear, honest information about natural health options, including
              where the evidence is thin.
            </p>
          </Section>

          <Section index={2} title="How It Works">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Remedi uses a three-tier search strategy to find the most relevant
              natural alternatives for any pharmaceutical.
            </p>
            <ol className="mt-6 divide-y divide-border border-y border-border">
              {SEARCH_STEPS.map(({ step, icon: Icon, title, description }) => (
                <li key={step} className="flex gap-5 py-5">
                  <span className="pt-0.5 font-mono text-xs text-primary">
                    0{step}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <h3 className="text-sm font-semibold">{title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section index={3} title="Data Sources">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Our recommendations are built on data from trusted, diverse
              sources.
            </p>
            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DATA_SOURCES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-md border border-border bg-card px-3.5 py-3"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-sm">{label}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section index={4} title="Evidence Levels">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every remedy in our database is classified by the strength of its
              supporting scientific evidence.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Object.entries(EVIDENCE_LEVELS).map(([key, meta]) => (
                <div
                  key={key}
                  className="rounded-md border border-border bg-card p-4"
                >
                  <EvidenceBadge level={key} />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {meta.description}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section index={5} title="Disclaimer">
            <Alert variant="warning">
              <AlertTriangle />
              <AlertTitle>Not medical advice</AlertTitle>
              <AlertDescription>
                Remedi is for informational purposes only and should not replace
                professional medical advice. Always consult with a healthcare
                provider before making changes to your health regimen.
              </AlertDescription>
            </Alert>
          </Section>
        </main>
      </div>
    </div>
  );
}
