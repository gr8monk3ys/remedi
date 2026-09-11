/**
 * A failed check is not a denial.
 *
 * FeatureGate did `catch { setHasAccess(false) }`, so one failed /api/usage
 * call rendered a Premium subscriber a lock overlay and an Upgrade button for
 * a feature they already pay for. One of the gated features is Cabinet
 * Interaction Alerts, so guessing "denied" also hid a safety feature behind a
 * sales pitch.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...p } =
        props;
      void initial;
      void animate;
      void exit;
      void transition;
      void whileHover;
      void whileTap;
      return <div {...p}>{children}</div>;
    },
    button: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...p } =
        props;
      void initial;
      void animate;
      void exit;
      void transition;
      void whileHover;
      void whileTap;
      return <button {...p}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockGet = vi.fn();
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn(),
  },
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
  createLogger: () => ({
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { FeatureGate } from "@/components/upgrade/FeatureGate";

const Protected = (): React.ReactElement => <p>cabinet alerts</p>;

describe("FeatureGate when the plan check fails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("says it could not check, rather than locking the feature", async () => {
    mockGet.mockRejectedValue(new Error("network down"));

    render(
      <FeatureGate feature="canViewCabinetInteractions">
        <Protected />
      </FeatureGate>,
    );

    expect(
      await screen.findByText(/could not check your plan/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/problem on our side, not a limit on your account/i),
    ).toBeInTheDocument();
  });

  it("does not try to sell an upgrade for a check that never completed", async () => {
    mockGet.mockRejectedValue(new Error("network down"));

    render(
      <FeatureGate feature="canViewCabinetInteractions">
        <Protected />
      </FeatureGate>,
    );

    await screen.findByText(/could not check your plan/i);
    expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/requires a .* plan/i)).not.toBeInTheDocument();
  });

  it("retries the check when asked, and shows the feature once it succeeds", async () => {
    mockGet.mockRejectedValueOnce(new Error("network down"));
    render(
      <FeatureGate feature="canViewCabinetInteractions">
        <Protected />
      </FeatureGate>,
    );
    await screen.findByText(/could not check your plan/i);

    mockGet.mockResolvedValue({ plan: "premium" });
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() =>
      expect(screen.getByText("cabinet alerts")).toBeInTheDocument(),
    );
  });

  it("still denies a genuine free-plan user", async () => {
    // The distinction only matters if a real denial is still a denial.
    mockGet.mockResolvedValue({ plan: "free" });

    render(
      <FeatureGate feature="canViewCabinetInteractions">
        <Protected />
      </FeatureGate>,
    );

    await waitFor(() =>
      expect(screen.queryByText(/could not check your plan/i)).toBeNull(),
    );
    expect(await screen.findByText(/requires a/i)).toBeInTheDocument();
  });
});
