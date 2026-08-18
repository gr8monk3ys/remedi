import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  Database,
  Globe,
  Cpu,
  BookOpen,
  Shield,
  FlaskConical,
  Leaf,
  AlertCircle,
} from "lucide-react";
import { EVIDENCE_LEVELS } from "@/lib/evidence-levels";
import { EvidenceBadge } from "@/components/remedy/EvidenceBadge";

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

export default function AboutPage(): React.JSX.Element {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">About Remedi</h1>
          <p className="text-muted-foreground mt-2">
            Discover how we help you find natural alternatives backed by
            evidence.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:px-8 space-y-8">
        {/* Mission */}
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold">Our Mission</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Remedi helps you discover evidence-based natural alternatives to
            pharmaceutical drugs and supplements. We believe everyone deserves
            access to information about natural health options.
          </p>
        </section>

        {/* How It Works */}
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold">How It Works</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Remedi uses a three-tier search strategy to find the most relevant
            natural alternatives for any pharmaceutical.
          </p>
          <div className="space-y-6">
            {SEARCH_STEPS.map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">
                    <span className="text-primary mr-2">Step {step}:</span>
                    {title}
                  </h3>
                  <p className="text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Sources */}
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold">Data Sources</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Our recommendations are built on data from trusted, diverse sources.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DATA_SOURCES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Evidence Levels */}
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-semibold">Evidence Levels</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Every remedy in our database is classified by the strength of its
            supporting scientific evidence.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(EVIDENCE_LEVELS).map(([key, meta]) => (
              <div key={key} className="rounded-lg border p-4">
                <EvidenceBadge level={key} className="mb-2" />
                <p className="text-muted-foreground text-sm">
                  {meta.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Remedi is for informational purposes only and should not replace
                professional medical advice. Always consult with a healthcare
                provider before making changes to your health regimen.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
