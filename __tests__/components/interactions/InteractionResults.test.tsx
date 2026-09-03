/**
 * Tests for InteractionResults.
 *
 * The property under test: the green "No Known Interactions Found" panel is
 * reachable only from a `known` outcome. A failed check must never render as
 * a clean one.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InteractionResults } from "@/components/interactions/InteractionResults";
import type { InteractionOutcome } from "@/lib/interactions/read";
import type { CheckResponse } from "@/components/interactions/interaction.types";

const EMPTY: InteractionOutcome<CheckResponse> = {
  kind: "known",
  data: {
    interactions: [],
    substancesChecked: ["Chamomile", "Ibuprofen"],
    pairsChecked: 1,
    interactionsFound: 0,
  },
};

const FOUND: InteractionOutcome<CheckResponse> = {
  kind: "known",
  data: {
    interactions: [
      {
        id: "1",
        substanceA: "St. John's Wort",
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
    substancesChecked: ["St. John's Wort", "Warfarin"],
    pairsChecked: 1,
    interactionsFound: 1,
  },
};

describe("InteractionResults", () => {
  it("shows the all-clear only for a known, empty result", () => {
    render(<InteractionResults outcome={EMPTY} />);

    // The summary line repeats the phrase, so anchor on the panel heading.
    expect(
      screen.getByRole("heading", { name: /No Known Interactions Found/i }),
    ).toBeInTheDocument();
  });

  it("renders the interactions it was given", () => {
    render(<InteractionResults outcome={FOUND} />);

    expect(screen.getByText(/Warfarin/)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /No Known Interactions Found/i }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ["unavailable", "Interaction check unavailable"],
    ["unauthenticated", "Sign in to check interactions"],
    ["rate-limited", "Too many checks just now"],
    ["plan-required", "Interaction checking needs a paid plan"],
  ] as const)("never shows the all-clear for reason %s", (reason, heading) => {
    render(
      <InteractionResults
        outcome={{ kind: "unknown", reason, message: "nope" }}
      />,
    );

    expect(screen.getByText(heading)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /No Known Interactions Found/i }),
    ).not.toBeInTheDocument();
  });
});
