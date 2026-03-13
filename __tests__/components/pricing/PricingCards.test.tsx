/**
 * PricingCards Component Tests
 *
 * Tests for the pricing cards grid including:
 * - Rendering all three pricing tiers (Free, Basic, Premium)
 * - Highlighting the recommended (Most Popular) plan
 * - Displaying correct prices for monthly and yearly billing
 * - Trial CTA visibility for eligible users
 * - Plan selection and checkout callbacks
 * - Current plan state rendering
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingCards } from "@/app/pricing/PricingCards";
import { PLANS } from "@/lib/stripe-config";

// Mock framer-motion to render plain divs
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => {
      // Filter out framer-motion-specific props
      const {
        initial,
        animate,
        exit,
        transition,
        whileHover,
        whileTap,
        ...htmlProps
      } = props;
      void initial;
      void animate;
      void exit;
      void transition;
      void whileHover;
      void whileTap;
      return <div {...htmlProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const defaultProps = {
  currentPlan: "free" as const,
  isYearly: false,
  loading: null,
  trialEligible: false,
  onCheckout: vi.fn(),
  onStartTrial: vi.fn(),
  basicDisplayPrice: "9.99",
  basicYearlyBilled: "95.90",
  premiumDisplayPrice: "19.99",
  premiumYearlyBilled: "191.90",
};

describe("PricingCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all three pricing tiers", () => {
    render(<PricingCards {...defaultProps} />);

    expect(screen.getByText(PLANS.free.name)).toBeInTheDocument();
    expect(screen.getByText(PLANS.basic.name)).toBeInTheDocument();
    expect(screen.getByText(PLANS.premium.name)).toBeInTheDocument();
  });

  it("renders plan descriptions", () => {
    render(<PricingCards {...defaultProps} />);

    expect(screen.getByText(PLANS.free.description)).toBeInTheDocument();
    expect(screen.getByText(PLANS.basic.description)).toBeInTheDocument();
    expect(screen.getByText(PLANS.premium.description)).toBeInTheDocument();
  });

  it("highlights the recommended plan with Most Popular badge", () => {
    render(<PricingCards {...defaultProps} />);

    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it("shows correct monthly prices", () => {
    render(<PricingCards {...defaultProps} />);

    expect(screen.getByText("$0")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
  });

  it("shows yearly billing info when isYearly is true", () => {
    render(<PricingCards {...defaultProps} isYearly={true} />);

    expect(screen.getByText(/Billed \$95.90\/year/)).toBeInTheDocument();
    expect(screen.getByText(/Billed \$191.90\/year/)).toBeInTheDocument();
  });

  it("does not show yearly billing info when isYearly is false", () => {
    render(<PricingCards {...defaultProps} isYearly={false} />);

    expect(screen.queryByText(/Billed.*\/year/)).not.toBeInTheDocument();
  });

  it('shows "Current Plan" for the active plan (free)', () => {
    render(<PricingCards {...defaultProps} currentPlan="free" />);

    const buttons = screen.getAllByRole("button");
    const freeButton = buttons.find((b) => b.textContent === "Current Plan");
    expect(freeButton).toBeInTheDocument();
  });

  it('shows "Current Plan" for the active plan (basic)', () => {
    render(<PricingCards {...defaultProps} currentPlan="basic" />);

    // Basic plan button should show "Current Plan"
    const buttons = screen.getAllByText("Current Plan");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Current Plan" for the active plan (premium)', () => {
    render(<PricingCards {...defaultProps} currentPlan="premium" />);

    const buttons = screen.getAllByText("Current Plan");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Get Started" on basic plan when user is on free plan', () => {
    render(<PricingCards {...defaultProps} currentPlan="free" />);

    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it('shows "Included" on basic plan when user is on premium plan', () => {
    render(<PricingCards {...defaultProps} currentPlan="premium" />);

    expect(screen.getByText("Included")).toBeInTheDocument();
  });

  it('calls onCheckout with "basic" when basic plan button is clicked', async () => {
    const user = userEvent.setup();
    const onCheckout = vi.fn();
    render(<PricingCards {...defaultProps} onCheckout={onCheckout} />);

    await user.click(screen.getByText("Get Started"));
    expect(onCheckout).toHaveBeenCalledWith("basic");
  });

  it('calls onCheckout with "premium" when premium upgrade button is clicked', async () => {
    const user = userEvent.setup();
    const onCheckout = vi.fn();
    render(
      <PricingCards
        {...defaultProps}
        onCheckout={onCheckout}
        trialEligible={false}
      />,
    );

    await user.click(screen.getByText("Upgrade to Premium"));
    expect(onCheckout).toHaveBeenCalledWith("premium");
  });

  it("shows trial CTA when trial eligible and on free plan", () => {
    render(
      <PricingCards
        {...defaultProps}
        trialEligible={true}
        currentPlan="free"
      />,
    );

    expect(screen.getByText("Start 7-Day Free Trial")).toBeInTheDocument();
  });

  it("does not show trial CTA when not trial eligible", () => {
    render(
      <PricingCards
        {...defaultProps}
        trialEligible={false}
        currentPlan="free"
      />,
    );

    expect(
      screen.queryByText("Start 7-Day Free Trial"),
    ).not.toBeInTheDocument();
  });

  it("does not show trial CTA for paid users even if eligible", () => {
    render(
      <PricingCards
        {...defaultProps}
        trialEligible={true}
        currentPlan="basic"
      />,
    );

    expect(
      screen.queryByText("Start 7-Day Free Trial"),
    ).not.toBeInTheDocument();
  });

  it("calls onStartTrial when trial button is clicked", async () => {
    const user = userEvent.setup();
    const onStartTrial = vi.fn();
    render(
      <PricingCards
        {...defaultProps}
        trialEligible={true}
        currentPlan="free"
        onStartTrial={onStartTrial}
      />,
    );

    await user.click(screen.getByText("Start 7-Day Free Trial"));
    expect(onStartTrial).toHaveBeenCalledTimes(1);
  });

  it('shows "Subscribe Now" on premium button when trial is eligible and user is free', () => {
    render(
      <PricingCards
        {...defaultProps}
        trialEligible={true}
        currentPlan="free"
      />,
    );

    expect(screen.getByText("Subscribe Now")).toBeInTheDocument();
  });

  it('disables basic plan button when loading is "basic"', () => {
    render(<PricingCards {...defaultProps} loading="basic" />);

    // The basic plan button should be disabled
    const getStartedButton = screen.queryByText("Get Started");
    expect(getStartedButton).not.toBeInTheDocument();
    // Loader should be visible instead (the button still exists, just shows spinner)
  });

  it("renders features for each plan", () => {
    render(<PricingCards {...defaultProps} />);

    // Check a feature from each plan
    expect(screen.getByText(PLANS.free.features[0])).toBeInTheDocument();
    expect(screen.getByText(PLANS.basic.features[0])).toBeInTheDocument();
    expect(screen.getByText(PLANS.premium.features[0])).toBeInTheDocument();
  });
});
