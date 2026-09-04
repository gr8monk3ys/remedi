import { Database, Globe, Cpu } from "lucide-react";
import { OnboardingWrapper } from "@/components/home/OnboardingWrapper";
import { FavoritesSection } from "@/components/home/FavoritesSection";
import { SearchSection } from "@/components/home/SearchSection";

const LABELS = [
  {
    label: "Alternative",
    body: "May stand in for the drug. The strongest claim, and the rarest — most medications never carry it.",
  },
  {
    label: "Complementary",
    body: "May be taken alongside the drug, not instead of it.",
  },
  {
    label: "Supportive",
    body: "Neither. Offers general support only, and says so.",
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
            <h1 className="reveal-up mx-auto max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
              Search a drug. See what honestly
              <span className="block text-muted-foreground">
                relates to it.
              </span>
            </h1>
            <p className="reveal-up reveal-delay-1 mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Every match is labelled Alternative, Complementary or Supportive,
              so you can see what it is actually claiming. Some medications
              carry no matches at all — that is a decision, not a gap.
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

          {/* What a label is allowed to claim */}
          <section className="pt-12 pb-16">
            <h2 className="text-sm font-semibold">
              What a label is allowed to claim
            </h2>
            <dl className="mt-4 divide-y divide-border border-y border-border">
              {LABELS.map(({ label, body }) => (
                <div
                  key={label}
                  className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"
                >
                  <dt className="text-sm font-medium text-foreground">
                    {label}
                  </dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* How it works */}
          <section className="grid gap-8 border-t border-border py-16 md:grid-cols-[1fr_1.6fr] md:gap-16">
            <div>
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
