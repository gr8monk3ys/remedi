import { Check, Search, Shield, Sparkles } from "lucide-react";
import { EvidenceBadge } from "@/components/remedy/EvidenceBadge";
import { LandingClient } from "./landing-client";

export const metadata = {
  title: "Remedi | Natural Remedies, Backed by Science",
  description:
    "Discover natural alternatives to common pharmaceuticals. Personalized search, evidence-backed recommendations, and a clear path to safer choices.",
};

const FEATURES = [
  {
    icon: Search,
    title: "Faster decisions",
    body: "Database-first search surfaces reviewed matches instantly, then falls back to OpenFDA for anything else.",
  },
  {
    icon: Shield,
    title: "Trustworthy sources",
    body: "Every remedy carries an evidence level and the references behind it, so you can check the claim yourself.",
  },
  {
    icon: Sparkles,
    title: "Personalized",
    body: "Favorites, history, an interaction checker and a journal tailor Remedi to what you actually take.",
  },
] as const;

const SAMPLE_RESULTS = [
  { name: "Turmeric (curcumin)", level: "Strong", relevance: 85 },
  { name: "Ginger", level: "Moderate", relevance: 72 },
  { name: "Willow bark", level: "Limited", relevance: 64 },
] as const;

const CHECKLIST = [
  "Clear evidence levels on every remedy",
  "Drug and supplement interaction checks",
  "Side-by-side comparison of your options",
] as const;

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden px-4 pt-14 md:px-8">
      <div className="hero-glow" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl">
        {/* Hero */}
        <section className="grid items-center gap-12 pt-20 pb-16 md:grid-cols-[1.15fr_1fr] md:pt-28">
          <div className="reveal-up">
            <p className="eyebrow">Early access</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] md:text-5xl">
              Natural alternatives that are practical, safe, and evidence-based.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Remedi helps people compare pharmaceuticals with natural options,
              understand the risks, and make informed decisions fast. Built for
              everyday users and professionals.
            </p>
            <div className="mt-8">
              <LandingClient />
            </div>
          </div>

          {/* Example result panel */}
          <div
            className="reveal-up reveal-delay-1 overflow-hidden rounded-lg border border-border bg-card"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="eyebrow eyebrow-muted">Search</span>
              <span className="font-mono text-xs text-foreground">
                ibuprofen
              </span>
            </div>
            <ul className="divide-y divide-border">
              {SAMPLE_RESULTS.map((result) => (
                <li
                  key={result.name}
                  className="flex items-center justify-between gap-4 px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {result.name}
                    </p>
                    <div className="mt-1.5">
                      <EvidenceBadge level={result.level} />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="h-1 w-14 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${result.relevance}%` }}
                      />
                    </div>
                    <span className="tabular font-mono text-[11px] text-muted-foreground">
                      {result.relevance}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
              Relevance is informational, not a measure of effectiveness.
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="pb-16">
          <div className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-border max-sm:divide-y max-sm:divide-border">
            {FEATURES.map(({ icon: Icon, title, body }, index) => (
              <div key={title} className="p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
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

        {/* Evidence */}
        <section className="grid gap-10 border-t border-border py-16 md:grid-cols-2 md:gap-16">
          <div className="reveal-up">
            <p className="eyebrow">Evidence first</p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
              Built so you can judge the evidence yourself
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Every remedy carries an evidence level and its sources, so you can
              see how well-supported it is before you discuss it with your
              healthcare provider.
            </p>
            <ul className="mt-6 space-y-3">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="premium-gradient-panel reveal-up reveal-delay-1 rounded-lg p-8 text-white">
            <p className="eyebrow text-white/70">What you can do here</p>
            <h3 className="mt-3 text-2xl font-semibold">
              Compare, check, and keep track
            </h3>
            <p className="mt-3 leading-relaxed text-white/80">
              Compare remedies side by side, check interactions with what you
              already take, and keep a journal of what actually works for you.
            </p>
            <div className="mt-6">
              <LandingClient trackView={false} inverted />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
