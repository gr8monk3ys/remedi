/**
 * CookieConsent Component Tests
 *
 * Tests for the cookie consent banner including:
 * - Showing banner on first visit (no localStorage value)
 * - Hiding after accepting
 * - Hiding after declining
 * - Not showing if already consented (localStorage set)
 * - Storing choice in localStorage
 * - Rendering correct UI elements
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookieConsent } from "@/components/CookieConsent";

// localStorage is already mocked globally in setup.ts
// We just need to configure return values per test

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows banner on first visit when no consent stored", () => {
    // localStorage.getItem returns null (no previous consent)
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    render(<CookieConsent />);

    expect(
      screen.getByRole("dialog", { name: "Cookie consent" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/This site uses cookies/)).toBeInTheDocument();
    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(screen.getByText("Decline")).toBeInTheDocument();
  });

  it("does not show banner if consent was already accepted", () => {
    vi.mocked(localStorage.getItem).mockReturnValue("accepted");

    render(<CookieConsent />);

    expect(
      screen.queryByRole("dialog", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it("does not show banner if consent was already declined", () => {
    vi.mocked(localStorage.getItem).mockReturnValue("declined");

    render(<CookieConsent />);

    expect(
      screen.queryByRole("dialog", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it('hides banner and stores "accepted" when Accept is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    render(<CookieConsent />);

    expect(
      screen.getByRole("dialog", { name: "Cookie consent" }),
    ).toBeInTheDocument();

    await user.click(screen.getByText("Accept"));

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cookie-consent",
      "accepted",
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Cookie consent" }),
      ).not.toBeInTheDocument();
    });
  });

  it('hides banner and stores "declined" when Decline is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    render(<CookieConsent />);

    expect(
      screen.getByRole("dialog", { name: "Cookie consent" }),
    ).toBeInTheDocument();

    await user.click(screen.getByText("Decline"));

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cookie-consent",
      "declined",
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Cookie consent" }),
      ).not.toBeInTheDocument();
    });
  });

  it("reads from localStorage with the correct key on mount", () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    render(<CookieConsent />);

    expect(localStorage.getItem).toHaveBeenCalledWith("cookie-consent");
  });

  it("renders the consent message text", () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    render(<CookieConsent />);

    expect(
      screen.getByText(
        "This site uses cookies for functionality and analytics. By accepting, you consent to our use of cookies.",
      ),
    ).toBeInTheDocument();
  });
});
