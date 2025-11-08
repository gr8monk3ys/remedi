import type { Analytics } from "./analytics.types";
import { StatCard, RateCard } from "./StatCard";

export function ActivationFunnelSection({
  activation,
}: {
  activation: Analytics["activation"];
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Activation Funnel (Last 7 Days)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Landing Views" value={activation.landingViews} />
        <StatCard
          label="Landing CTA Clicks"
          value={activation.landingCtaClicks}
        />
        <StatCard label="Search Events" value={activation.searches} />
        <StatCard label="Remedy Views" value={activation.remedyViews} />
        <StatCard label="Favorites Added" value={activation.favorites} />
        <StatCard label="Reviews Submitted" value={activation.reviews} />
        <StatCard label="Pricing Views" value={activation.pricingViews} />
        <StatCard
          label="Pricing Selections"
          value={activation.pricingSelections}
        />
        <StatCard label="Checkout Started" value={activation.checkoutStarted} />
        <StatCard
          label="Checkout Completed"
          value={activation.checkoutCompleted}
          highlight="green"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <RateCard label="CTA → Pricing" value={activation.rates.ctaToPricing} />
        <RateCard
          label="Pricing → Checkout"
          value={activation.rates.pricingToCheckout}
        />
        <RateCard
          label="Checkout → Paid"
          value={activation.rates.checkoutToPaid}
        />
        <RateCard
          label="Landing → Paid"
          value={activation.rates.landingToCheckout}
        />
      </div>
    </section>
  );
}
