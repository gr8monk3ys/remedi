import {
  Database,
  Globe,
  Cpu,
  Leaf,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import { OnboardingWrapper } from "@/components/home/OnboardingWrapper";
import { FavoritesSection } from "@/components/home/FavoritesSection";
import { SearchSection } from "@/components/home/SearchSection";

const FEATURES = [
  {
    icon: Search,
    title: "Smart Search",
    body: "Search by drug name, symptom, or condition. Our database maps FDA-approved drugs to natural alternatives.",
  },
  {
    icon: Shield,
    title: "Evidence-Based",
    body: "Every remedy includes evidence levels, dosage guidance, and scientific references you can verify.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    body: "Describe your needs in natural language. Our AI understands queries like “I need help sleeping.”",
  },
] as const;

const STEPS = [
  {
    icon: Database,
    title: "Curated database",
    body: "Every search starts against a reviewed set of drug-to-remedy mappings with safety rules applied.",
  },
  {
    icon: Globe,
    title: "OpenFDA lookup",
    body: "Drugs we have not mapped yet are resolved through the FDA's public label data.",
  },
  {
    icon: Cpu,
    title: "Ingredient matching",
    body: "Active ingredients and properties are scored against remedies. Weak matches are hidden.",
  },
] as const;

export default function Home() {
  return (
    <>
      <OnboardingWrapper />

      <main className="relative overflow-hidden px-4 pt-14 md:px-8">
        <div className="hero-glow" aria-hidden="true" />

        <div className="relative mx-auto max-w-5xl">
          {/* Hero */}
          <section className="pt-20 pb-10 text-center md:pt-28 md:pb-14">
            <p className="eyebrow reveal-up inline-flex items-center gap-2">
              <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
              Evidence-based natural alternatives
            </p>
            <h1 className="reveal-up reveal-delay-1 mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
              Find natural alternatives
              <span className="block text-muted-foreground">
                to pharmaceuticals
              </span>
            </h1>
            <p className="reveal-up reveal-delay-2 mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Search any drug or supplement to discover evidence-based natural
              remedies. Each match carries an evidence rating, dosage guidance,
              and the studies behind it.
            </p>
          </section>

          {/* Search */}
          <section className="reveal-up reveal-delay-2 mx-auto w-full max-w-2xl pb-8">
            <SearchSection />
          </section>

          {/* Favorites */}
          <section className="mx-auto w-full max-w-2xl pb-8">
            <FavoritesSection />
          </section>

          {/* Features */}
          <section className="pt-12 pb-16">
            <div className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-border max-sm:divide-y max-sm:divide-border">
              {FEATURES.map(({ icon: Icon, title, body }, index) => (
                <div key={title} className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
                      <Icon
                        className="h-4 w-4 text-primary"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-sm font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="grid gap-8 border-t border-border py-16 md:grid-cols-[1fr_1.6fr] md:gap-16">
            <div>
              <p className="eyebrow">How a search works</p>
              <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
                Three passes, from curated data to a scored match
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Results are only as good as the evidence behind them. The
                pipeline prefers reviewed mappings and falls back to public
                data, never the other way round.
              </p>
            </div>
            <ol className="divide-y divide-border border-y border-border">
              {STEPS.map(({ icon: Icon, title, body }, index) => (
                <li key={title} className="flex gap-5 py-5">
                  <span className="pt-0.5 font-mono text-xs text-primary">
                    0{index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <h3 className="text-sm font-semibold">{title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Disclaimer */}
          <section className="mx-auto max-w-2xl pb-16">
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              This application is for informational purposes only and is not a
              substitute for professional medical advice. Always consult a
              healthcare provider before making changes to your treatment plan.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
