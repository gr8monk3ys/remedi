/**
 * TrialBanner Component Tests
 *
 * Tests for the trial status banner including:
 * - Showing trial days remaining
 * - Showing upgrade CTA
 * - Hiding when dismissed
 * - Not rendering for unauthenticated users
 * - Urgent and warning styling thresholds
 * - TrialBadge compact variant
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrialBanner, TrialBadge } from "@/components/upgrade/TrialBanner";

// Track the mock return values so we can change them per test
const mockUseAuth = vi.fn();

// Mock Clerk — override the global setup mock
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(() => ({ user: null, isLoaded: true, isSignedIn: false })),
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
  useClerk: vi.fn(() => ({ signOut: vi.fn() })),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: () => null,
  SignedOut: ({ children }: { children: React.ReactNode }) => children,
  SignInButton: () => null,
  SignUpButton: () => null,
  UserButton: () => null,
}));

const mockApiGet = vi.fn();

// Mock the apiClient
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: vi.fn().mockResolvedValue({}),
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

const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockRouterPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
}));

describe("TrialBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      userId: "user_123",
      isLoaded: true,
      isSignedIn: true,
      signOut: vi.fn(),
    });
  });

  it("shows trial days remaining for active trial", async () => {
    mockApiGet.mockResolvedValue({
      isActive: true,
      isEligible: false,
      daysRemaining: 5,
      endDate: "2026-03-17T00:00:00Z",
    });

    render(<TrialBanner />);

    await waitFor(() => {
      expect(
        screen.getByText("5 days left in your Premium trial"),
      ).toBeInTheDocument();
    });
  });

  it("shows urgent message when 1 day remaining (<=2 threshold)", async () => {
    mockApiGet.mockResolvedValue({
      isActive: true,
      isEligible: false,
      daysRemaining: 1,
      endDate: "2026-03-13T00:00:00Z",
    });

    render(<TrialBanner />);

    // 1 day remaining is within the urgent threshold (<=2)
    await waitFor(() => {
      expect(screen.getByText("Your trial ends soon!")).toBeInTheDocument();
    });
  });

  it("shows urgent message when 2 or fewer days remaining", async () => {
    mockApiGet.mockResolvedValue({
      isActive: true,
      isEligible: false,
      daysRemaining: 2,
      endDate: "2026-03-14T00:00:00Z",
    });

    render(<TrialBanner />);

    await waitFor(() => {
      expect(screen.getByText("Your trial ends soon!")).toBeInTheDocument();
    });
  });

  it("shows upgrade CTA button", async () => {
    mockApiGet.mockResolvedValue({
      isActive: true,
      isEligible: false,
      daysRemaining: 5,
      endDate: "2026-03-17T00:00:00Z",
    });

    render(<TrialBanner />);

    await waitFor(() => {
      expect(screen.getByText("Upgrade Now")).toBeInTheDocument();
    });
  });

  it("navigates to pricing when Upgrade Now is clicked", async () => {
    const user = userEvent.setup();
    mockApiGet.mockResolvedValue({
      isActive: true,
      isEligible: false,
      daysRemaining: 5,
      endDate: "2026-03-17T00:00:00Z",
    });

    render(<TrialBanner />);

    await waitFor(() => {
      expect(screen.getByText("Upgrade Now")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Upgrade Now"));
    expect(mockRouterPush).toHaveBeenCalledWith("/pricing");
  });

  it("hides when dismissed", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    mockApiGet.mockResolvedValue({
      isActive: true,
      isEligible: false,
      daysRemaining: 5,
      endDate: "2026-03-17T00:00:00Z",
    });

    render(<TrialBanner dismissable={true} onDismiss={onDismiss} />);

    await waitFor(() => {
      expect(screen.getByText("Upgrade Now")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);

    // After dismiss, banner content should no longer be visible
    await waitFor(() => {
      expect(screen.queryByText("Upgrade Now")).not.toBeInTheDocument();
    });
  });

  it("does not show dismiss button when dismissable is false", async () => {
    mockApiGet.mockResolvedValue({
      isActive: true,
      isEligible: false,
      daysRemaining: 5,
      endDate: "2026-03-17T00:00:00Z",
    });

    render(<TrialBanner dismissable={false} />);

    await waitFor(() => {
      expect(screen.getByText("Upgrade Now")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: "Dismiss" }),
    ).not.toBeInTheDocument();
  });

  it("does not render for unauthenticated users", () => {
    mockUseAuth.mockReturnValue({
      userId: null,
      isLoaded: true,
      isSignedIn: false,
      signOut: vi.fn(),
    });

    render(<TrialBanner />);

    expect(screen.queryByText("Upgrade Now")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/left in your Premium trial/),
    ).not.toBeInTheDocument();
  });

  it("does not render when trial is not active", async () => {
    mockApiGet.mockResolvedValue({
      isActive: false,
      isEligible: true,
      daysRemaining: 0,
      endDate: null,
    });

    render(<TrialBanner />);

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalled();
    });

    expect(screen.queryByText("Upgrade Now")).not.toBeInTheDocument();
  });

  it("shows end date when provided", async () => {
    mockApiGet.mockResolvedValue({
      isActive: true,
      isEligible: false,
      daysRemaining: 5,
      endDate: "2026-03-17T00:00:00Z",
    });

    render(<TrialBanner />);

    await waitFor(() => {
      expect(screen.getByText(/Ends/)).toBeInTheDocument();
    });
  });
});

describe("TrialBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      userId: "user_123",
      isLoaded: true,
      isSignedIn: true,
      signOut: vi.fn(),
    });
  });

  it("shows trial days remaining in compact badge", async () => {
    mockApiGet.mockResolvedValue({
      isActive: true,
      isEligible: false,
      daysRemaining: 5,
      endDate: "2026-03-17T00:00:00Z",
    });

    render(<TrialBadge />);

    await waitFor(() => {
      expect(screen.getByText("Trial: 5d left")).toBeInTheDocument();
    });
  });

  it("does not render when not signed in", () => {
    mockUseAuth.mockReturnValue({
      userId: null,
      isLoaded: true,
      isSignedIn: false,
      signOut: vi.fn(),
    });

    render(<TrialBadge />);

    expect(screen.queryByText(/Trial:/)).not.toBeInTheDocument();
  });

  it("does not render when trial is not active", async () => {
    mockApiGet.mockResolvedValue({
      isActive: false,
      isEligible: true,
      daysRemaining: 0,
      endDate: null,
    });

    render(<TrialBadge />);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalled();
    });

    expect(screen.queryByText(/Trial:/)).not.toBeInTheDocument();
  });
});
