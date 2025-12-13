import { Leaf, Search, Shield, Sparkles } from "lucide-react";
import { OnboardingWrapper } from "@/components/home/OnboardingWrapper";
import { FavoritesSection } from "@/components/home/FavoritesSection";
import { SearchSection } from "@/components/home/SearchSection";

export default function Home() {
  return (
    <>
      <OnboardingWrapper />

      <main className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pt-24 md:px-8 lg:px-16">
        <div
          className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full opacity-50 soft-float"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--primary) 35%, transparent), transparent 65%)",
          }}
        />
        <div
          className="pointer-events-none absolute top-36 -right-24 h-72 w-72 rounded-full opacity-40 soft-float"
          style={{
            animationDelay: "1.2s",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent-dark) 28%, transparent), transparent 62%)",
          }}
        />

        {/* Hero Section */}
        <section className="w-full max-w-3xl pt-8 pb-12 text-center md:pt-16 md:pb-20">
          <div className="reveal-up mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Leaf className="h-3.5 w-3.5" />
            Evidence-based natural alternatives
          </div>
          <h1 className="reveal-up reveal-delay-1 mt-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Find natural alternatives
            <span className="block text-muted-foreground">
              to pharmaceuticals
            </span>
          </h1>
          <p className="reveal-up reveal-delay-2 mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Search any drug or supplement to discover evidence-based natural
            remedies. Backed by research, powered by science.
          </p>
        </section>

        {/* Search Section */}
        <section className="reveal-up reveal-delay-2 w-full max-w-2xl pb-12">
          <SearchSection />
        </section>

        {/* Favorites Section */}
        <section className="reveal-up reveal-delay-2 w-full max-w-2xl pb-12">
          <FavoritesSection />
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-3xl pb-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="reveal-up reveal-delay-1 surface-glow rounded-lg border bg-card/90 p-5 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-3 inline-flex rounded-md bg-primary/10 p-2">
                <Search className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">Smart Search</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Search by drug name, symptom, or condition. Our database maps
                FDA-approved drugs to natural alternatives.
              </p>
            </div>
            <div className="reveal-up reveal-delay-2 surface-glow rounded-lg border bg-card/90 p-5 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-3 inline-flex rounded-md bg-primary/10 p-2">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">Evidence-Based</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Every remedy includes evidence levels, dosage guidance, and
                scientific references you can verify.
              </p>
            </div>
            <div className="reveal-up reveal-delay-3 surface-glow rounded-lg border bg-card/90 p-5 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-3 inline-flex rounded-md bg-primary/10 p-2">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">AI-Powered</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Describe your needs in natural language. Our AI understands
                queries like &quot;I need help sleeping.&quot;
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="w-full max-w-2xl pb-12">
          <p className="text-center text-xs text-muted-foreground">
            This application is for informational purposes only and is not a
            substitute for professional medical advice. Always consult a
            healthcare provider before making changes to your treatment plan.
          </p>
        </section>
      </main>
    </>
  );
}
