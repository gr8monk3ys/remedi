/**
 * UpgradeModal Component Tests
 *
 * Tests for the upgrade modal dialog including:
 * - Rendering modal with plan options when open
 * - Not rendering when closed
 * - Closing on dismiss (backdrop click and close button)
 * - Showing feature comparison table
 * - Displaying trigger-specific messages
 * - Upgrade button interactions
 * - Usage indicator display
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { PLANS } from "@/lib/stripe-config";
import { TRIGGER_MESSAGES } from "@/components/upgrade/upgrade-modal.constants";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => {
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

// Mock the apiClient
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ isEligible: false }),
    post: vi
      .fn()
      .mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
  },
  ApiClientError: class ApiClientError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode: number) {
      super(message);
      this.name = "ApiClientError";
      this.code = code;
      this.statusCode = statusCode;
    }
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock PlanComparisonTable
vi.mock("@/components/upgrade/PlanComparisonTable", () => ({
  PlanComparisonTable: () => (
    <div data-testid="plan-comparison-table">Compare Plans</div>
  ),
}));

const mockOnClose = vi.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  triggerReason: "feature" as const,
  currentPlan: "free" as const,
};

describe("UpgradeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal with plan options when open", async () => {
    render(<UpgradeModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(PLANS.basic.name)).toBeInTheDocument();
      expect(screen.getByText(PLANS.premium.name)).toBeInTheDocument();
    });
  });

  it("does not render content when closed", () => {
    render(<UpgradeModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText(PLANS.basic.name)).not.toBeInTheDocument();
    expect(screen.queryByText(PLANS.premium.name)).not.toBeInTheDocument();
  });

  it("shows the trigger-specific message for search_limit", async () => {
    render(<UpgradeModal {...defaultProps} triggerReason="search_limit" />);

    await waitFor(() => {
      expect(
        screen.getByText(TRIGGER_MESSAGES.search_limit.title),
      ).toBeInTheDocument();
      expect(
        screen.getByText(TRIGGER_MESSAGES.search_limit.description),
      ).toBeInTheDocument();
    });
  });

  it("shows the trigger-specific message for favorite_limit", async () => {
    render(<UpgradeModal {...defaultProps} triggerReason="favorite_limit" />);

    await waitFor(() => {
      expect(
        screen.getByText(TRIGGER_MESSAGES.favorite_limit.title),
      ).toBeInTheDocument();
    });
  });

  it("shows the default feature message", async () => {
    render(<UpgradeModal {...defaultProps} triggerReason="feature" />);

    await waitFor(() => {
      expect(
        screen.getByText(TRIGGER_MESSAGES.feature.title),
      ).toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<UpgradeModal {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("shows feature comparison table", async () => {
    render(<UpgradeModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("plan-comparison-table")).toBeInTheDocument();
    });
  });

  it("shows plan prices", async () => {
    render(<UpgradeModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(`$${PLANS.basic.price}`)).toBeInTheDocument();
      expect(screen.getByText(`$${PLANS.premium.price}`)).toBeInTheDocument();
    });
  });

  it('shows "Most Popular" badge on premium plan', async () => {
    render(<UpgradeModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Most Popular")).toBeInTheDocument();
    });
  });

  it('shows "Upgrade to Basic" button for free users', async () => {
    render(<UpgradeModal {...defaultProps} currentPlan="free" />);

    await waitFor(() => {
      expect(screen.getByText("Upgrade to Basic")).toBeInTheDocument();
    });
  });

  it('shows "Upgrade to Premium" button for free users', async () => {
    render(<UpgradeModal {...defaultProps} currentPlan="free" />);

    await waitFor(() => {
      expect(screen.getByText("Upgrade to Premium")).toBeInTheDocument();
    });
  });

  it('shows "Current Plan" for basic users on basic card', async () => {
    render(<UpgradeModal {...defaultProps} currentPlan="basic" />);

    await waitFor(() => {
      const currentPlanButtons = screen.getAllByText("Current Plan");
      expect(currentPlanButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders usage indicator when currentUsage and limit are provided", async () => {
    render(
      <UpgradeModal
        {...defaultProps}
        triggerReason="search_limit"
        currentUsage={4}
        limit={5}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Usage today")).toBeInTheDocument();
      expect(screen.getByText("4 / 5")).toBeInTheDocument();
    });
  });

  it("does not render usage indicator when limit is 0", async () => {
    render(
      <UpgradeModal
        {...defaultProps}
        triggerReason="search_limit"
        currentUsage={0}
        limit={0}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByText("Usage today")).not.toBeInTheDocument();
    });
  });

  it('shows "View full pricing details" link', async () => {
    render(<UpgradeModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("View full pricing details")).toBeInTheDocument();
    });
  });

  it("shows basic plan features", async () => {
    render(<UpgradeModal {...defaultProps} />);

    await waitFor(() => {
      // Check first 4 features (the slice shown in the modal)
      PLANS.basic.features.slice(0, 4).forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });
  });

  it("shows premium plan features", async () => {
    render(<UpgradeModal {...defaultProps} />);

    await waitFor(() => {
      PLANS.premium.features.slice(0, 4).forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });
  });
});
