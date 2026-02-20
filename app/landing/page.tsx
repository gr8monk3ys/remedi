import { LandingClient } from "./landing-client";

export const metadata = {
  title: "Remedi | Natural Remedies, Backed by Science",
  description:
    "Discover natural alternatives to common pharmaceuticals. Personalized search, evidence-backed recommendations, and a clear path to safer choices.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-surface to-background">
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col gap-10">
            <div className="reveal-up">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                Launching Early Access
              </span>
              <h1 className="mt-6 text-4xl font-semibold text-foreground md:text-5xl">
                Find natural alternatives that are practical, safe, and
                evidence-based.
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Remedi helps people compare pharmaceuticals with natural
                options, understand risks, and make informed decisions fast.
                Built for everyday users and professionals.
              </p>
            </div>

            <div className="reveal-up reveal-delay-1">
              <LandingClient />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Faster decisions",
                  body: "Database-first search surfaces proven matches instantly.",
                },
                {
                  title: "Trustworthy sources",
                  body: "See scientific references and evidence levels at a glance.",
                },
                {
                  title: "Personalized",
                  body: "Favorites, history, and filters tailor your journey.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="reveal-up surface-glow rounded-xl border border-border bg-card/90 p-6 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card/65 py-16 px-4 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-10">
          <div className="reveal-up">
            <h2 className="text-3xl font-bold text-foreground">
              Built to increase trust and conversion
            </h2>
            <p className="mt-4 text-muted-foreground">
              We focus on the decisions that lead to upgrades: confidence in the
              science, clarity of value, and a frictionless path to start.
            </p>
            <ul className="mt-6 space-y-3 text-foreground">
              <li>• Clear evidence levels on every remedy</li>
              <li>• Trial-friendly onboarding</li>
              <li>• Premium workflows for professionals</li>
            </ul>
          </div>
          <div className="reveal-up reveal-delay-1 rounded-2xl bg-gradient-to-br from-[color-mix(in_srgb,var(--primary-dark)_80%,black)] via-[color-mix(in_srgb,var(--primary)_72%,black)] to-[color-mix(in_srgb,var(--accent-dark)_56%,black)] p-8 text-white shadow-lg">
            <h3 className="text-2xl font-semibold">Why users stay</h3>
            <p className="mt-3 text-white/85">
              Practical comparisons, decision support, and continuous updates
              keep users coming back.
            </p>
            <div className="mt-6">
              <LandingClient trackView={false} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
