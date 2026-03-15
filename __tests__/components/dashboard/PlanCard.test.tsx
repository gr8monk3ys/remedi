/**
 * PlanCard Component Tests
 *
 * Tests for the dashboard plan card including:
 * - Displaying current plan info
 * - Showing pricing (free and paid)
 * - Rendering plan features
 * - Current plan badge and state
 * - Popular badge display
 * - Upgrade/downgrade buttons
 * - Manage subscription button for current plan
 * - Loading skeleton state
 * - Yearly pricing display
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlanCard, PlanCardSkeleton } from "@/components/dashboard/PlanCard";

const defaultProps = {
  plan: "free" as const,
  name: "Free",
  description: "Get started with basic natural remedy search",
  price: 0,
  features: [
    "5 searches per day",
    "Save up to 3 favorites",
    "Health profile (categories & goals)",
  ],
};

describe("PlanCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays the plan name", () => {
    render(<PlanCard {...defaultProps} />);

    // "Free" appears as both the plan name (h3) and the price text (p)
    const freeTexts = screen.getAllByText("Free");
    expect(freeTexts.length).toBeGreaterThanOrEqual(1);
    // The h3 heading should contain the plan name
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Free");
  });

  it("displays the plan description", () => {
    render(<PlanCard {...defaultProps} />);

    expect(
      screen.getByText("Get started with basic natural remedy search"),
    ).toBeInTheDocument();
  });

  it('displays "Free" for zero-price plans', () => {
    render(<PlanCard {...defaultProps} price={0} />);

    // Both the plan name and the price should say "Free"
    const freeTexts = screen.getAllByText("Free");
    expect(freeTexts.length).toBe(2);
  });

  it("displays the monthly price for paid plans", () => {
    render(
      <PlanCard {...defaultProps} plan="basic" name="Basic" price={9.99} />,
    );

    expect(screen.getByText(/\$9\.99/)).toBeInTheDocument();
    expect(screen.getByText("/mo")).toBeInTheDocument();
  });

  it("displays yearly pricing when interval is yearly", () => {
    render(
      <PlanCard
        {...defaultProps}
        plan="basic"
        name="Basic"
        price={9.99}
        yearlyPrice={95.9}
        interval="yearly"
      />,
    );

    // Monthly equivalent of yearly price
    expect(screen.getByText(/\$7\.99/)).toBeInTheDocument();
    expect(screen.getByText(/\$95\.90 billed annually/)).toBeInTheDocument();
  });

  it("renders all plan features", () => {
    render(<PlanCard {...defaultProps} />);

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();

    defaultProps.features.forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it('shows "Current Plan" badge when isCurrentPlan is true', () => {
    render(<PlanCard {...defaultProps} isCurrentPlan={true} />);

    // "Current Plan" appears as both the badge and the status div
    const currentPlanTexts = screen.getAllByText("Current Plan");
    expect(currentPlanTexts.length).toBe(2);
  });

  it('shows "Most Popular" badge when isPopular is true and not current plan', () => {
    render(
      <PlanCard
        {...defaultProps}
        plan="premium"
        isPopular={true}
        isCurrentPlan={false}
      />,
    );

    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it('does not show "Most Popular" badge when isCurrentPlan is true', () => {
    render(
      <PlanCard
        {...defaultProps}
        plan="premium"
        isPopular={true}
        isCurrentPlan={true}
      />,
    );

    expect(screen.queryByText("Most Popular")).not.toBeInTheDocument();
  });

  it("shows upgrade button for non-current paid plans", () => {
    render(
      <PlanCard
        {...defaultProps}
        plan="basic"
        name="Basic"
        price={9.99}
        isCurrentPlan={false}
      />,
    );

    expect(screen.getByText("Upgrade")).toBeInTheDocument();
  });

  it("shows downgrade button for free plan when not current", () => {
    render(<PlanCard {...defaultProps} plan="free" isCurrentPlan={false} />);

    expect(screen.getByText("Downgrade")).toBeInTheDocument();
  });

  it("shows custom actionLabel when provided", () => {
    render(
      <PlanCard
        {...defaultProps}
        plan="basic"
        isCurrentPlan={false}
        actionLabel="Get Started"
      />,
    );

    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("calls onSelect when upgrade button is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <PlanCard
        {...defaultProps}
        plan="basic"
        name="Basic"
        price={9.99}
        isCurrentPlan={false}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByText("Upgrade"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows "Manage Subscription" button for current plan with onManage', async () => {
    const user = userEvent.setup();
    const onManage = vi.fn();

    render(
      <PlanCard {...defaultProps} isCurrentPlan={true} onManage={onManage} />,
    );

    const manageButton = screen.getByText("Manage Subscription");
    expect(manageButton).toBeInTheDocument();

    await user.click(manageButton);
    expect(onManage).toHaveBeenCalledTimes(1);
  });

  it('shows "Current Plan" text (not a button) when current plan and no onManage', () => {
    render(<PlanCard {...defaultProps} isCurrentPlan={true} />);

    // Should show Current Plan as both badge and status text
    const currentPlanTexts = screen.getAllByText("Current Plan");
    expect(currentPlanTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("disables upgrade button when onSelect is not provided", () => {
    render(<PlanCard {...defaultProps} plan="basic" isCurrentPlan={false} />);

    const button = screen.getByText("Upgrade");
    expect(button).toBeDisabled();
  });
});

describe("PlanCardSkeleton", () => {
  it("renders the loading skeleton", () => {
    const { container } = render(<PlanCardSkeleton />);

    // Skeleton should have the animate-pulse class
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(<PlanCardSkeleton className="custom-class" />);

    const skeleton = container.querySelector(".custom-class");
    expect(skeleton).toBeInTheDocument();
  });
});

describe("PlanCard loading state", () => {
  it("renders skeleton when isLoading is true", () => {
    const { container } = render(
      <PlanCard {...defaultProps} isLoading={true} />,
    );

    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();

    // Should not show plan name when loading
    expect(screen.queryByText("Free")).not.toBeInTheDocument();
  });
});
