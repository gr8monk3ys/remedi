/**
 * EvidenceBadge Component Tests
 *
 * Verifies that known evidence levels render labelled, explained badges, that
 * unknown levels degrade gracefully, and that missing levels render nothing.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvidenceBadge } from "@/components/remedy/EvidenceBadge";

describe("EvidenceBadge", () => {
  it("renders a labelled badge for a known level (case-insensitive)", () => {
    render(<EvidenceBadge level="strong" />);
    expect(screen.getByText("Strong evidence")).toBeInTheDocument();
  });

  it("maps each known level to its human label", () => {
    const { rerender } = render(<EvidenceBadge level="Moderate" />);
    expect(screen.getByText("Moderate evidence")).toBeInTheDocument();

    rerender(<EvidenceBadge level="Limited" />);
    expect(screen.getByText("Limited evidence")).toBeInTheDocument();

    rerender(<EvidenceBadge level="Traditional" />);
    expect(screen.getByText("Traditional use")).toBeInTheDocument();
  });

  it("exposes an accessible description of the evidence level", () => {
    render(<EvidenceBadge level="Strong" />);
    expect(
      screen.getByLabelText(/Evidence level: Strong evidence/i),
    ).toBeInTheDocument();
  });

  it("falls back to the raw label for an unrecognised level", () => {
    render(<EvidenceBadge level="Anecdotal" />);
    expect(screen.getByText("Anecdotal")).toBeInTheDocument();
  });

  it("renders nothing when the level is missing or blank", () => {
    const { container, rerender } = render(<EvidenceBadge level={null} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<EvidenceBadge level="   " />);
    expect(container).toBeEmptyDOMElement();

    rerender(<EvidenceBadge level={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
