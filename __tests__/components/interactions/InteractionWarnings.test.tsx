/**
 * Tests for InteractionWarnings.
 *
 * The critical property under test: a failed lookup must never be presented as
 * "no known interactions". On a health product that turns an outage into a
 * false medical all-clear.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { InteractionWarnings } from "@/components/interactions/InteractionWarnings";

const REMEDY = "St. John's Wort";

function mockFetchOnce(response: Partial<Response> & { json: () => unknown }) {
  global.fetch = vi.fn().mockResolvedValue(response as unknown as Response);
}

describe("InteractionWarnings", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the 'no known interactions' message only on a successful empty result", async () => {
    mockFetchOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    render(<InteractionWarnings remedyName={REMEDY} />);

    await waitFor(() =>
      expect(
        screen.getByText(/No known drug interactions found/),
      ).toBeInTheDocument(),
    );
  });

  it("does not claim 'no known interactions' when the API returns an error envelope", async () => {
    // A rate limit or database error returns a parseable {success:false} body.
    mockFetchOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" },
      }),
    });

    render(<InteractionWarnings remedyName={REMEDY} />);

    await waitFor(() =>
      expect(
        screen.getByText(/could not check for interactions/i),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/No known drug interactions found/),
    ).not.toBeInTheDocument();
  });

  it("does not claim 'no known interactions' when the request throws", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    render(<InteractionWarnings remedyName={REMEDY} />);

    await waitFor(() =>
      expect(
        screen.getByText(/could not check for interactions/i),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/No known drug interactions found/),
    ).not.toBeInTheDocument();
  });

  it("does not claim 'no known interactions' when the body is unparseable", async () => {
    mockFetchOnce({
      ok: true,
      json: async () => {
        throw new Error("invalid json");
      },
    });

    render(<InteractionWarnings remedyName={REMEDY} />);

    await waitFor(() =>
      expect(
        screen.getByText(/could not check for interactions/i),
      ).toBeInTheDocument(),
    );
  });

  it("renders returned interactions", async () => {
    mockFetchOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            id: "1",
            substanceA: REMEDY,
            substanceAType: "natural_remedy",
            substanceB: "Warfarin",
            substanceBType: "pharmaceutical",
            severity: "severe",
            description: "Reduces anticoagulant effect.",
            mechanism: null,
            recommendation: null,
            evidence: "established",
            sources: [],
          },
        ],
      }),
    });

    render(<InteractionWarnings remedyName={REMEDY} />);

    await waitFor(() =>
      expect(screen.getByText(/Warfarin/)).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/No known drug interactions found/),
    ).not.toBeInTheDocument();
  });
});
