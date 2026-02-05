import { LandingClient } from "./landing-client";

export const metadata = {
  title: "Remedi | Natural Remedies, Backed by Science",
  description:
    "Discover natural alternatives to common pharmaceuticals. Personalized search, evidence-backed recommendations, and a clear path to safer choices.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50">
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col gap-10">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1">
                Launching Early Access
              </span>
              <h1 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900">
                Find natural alternatives that are practical, safe, and
                evidence-based.
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                Remedi helps people compare pharmaceuticals with natural
                options, understand risks, and make informed decisions fast.
                Built for everyday users and professionals.
              </p>
            </div>

            <LandingClient />

            <div className="grid md:grid-cols-3 gap-6 mt-6">
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
                  className="rounded-xl bg-white shadow-sm border border-gray-100 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Built to increase trust and conversion
            </h2>
            <p className="mt-4 text-gray-600">
              We focus on the decisions that lead to upgrades: confidence in the
              science, clarity of value, and a frictionless path to start.
            </p>
            <ul className="mt-6 space-y-3 text-gray-700">
              <li>• Clear evidence levels on every remedy</li>
              <li>• Trial-friendly onboarding</li>
              <li>• Premium workflows for professionals</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-8 shadow-lg">
            <h3 className="text-2xl font-semibold">Why users stay</h3>
            <p className="mt-3 text-blue-100">
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
