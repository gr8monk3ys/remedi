/**
 * Severity must be legible without colour.
 *
 * The card carries severity in its border colour and its icon colour, and the
 * Severity Badge's text is what keeps that inside WCAG 2.2 AA. The glyph adds
 * a second non-colour channel: a reader scanning a list of interactions on a
 * phone reads the shape before the label.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InteractionCard } from "@/components/interactions/InteractionCard";
import type { Interaction } from "@/components/interactions/interaction.types";

const interaction = (severity: string): Interaction => ({
  id: `i-${severity}`,
  substanceA: "St. John's Wort",
  substanceAType: "natural_remedy",
  substanceB: "Sertraline",
  substanceBType: "pharmaceutical",
  severity,
  description: "Serotonin syndrome risk.",
  mechanism: null,
  recommendation: null,
  evidence: "established",
  sources: [],
});

const glyphOf = (container: HTMLElement): string => {
  const svg = container.querySelector("svg.lucide");
  return svg?.getAttribute("class")?.match(/lucide-shield[a-z-]*/)?.[0] ?? "";
};

describe("InteractionCard severity", () => {
  it("names the severity in text, not colour alone", () => {
    render(<InteractionCard interaction={interaction("contraindicated")} />);
    expect(screen.getByText("Contraindicated")).toBeInTheDocument();
  });

  it("gives the do-not-combine tier its own glyph", () => {
    const { container: never } = render(
      <InteractionCard interaction={interaction("contraindicated")} />,
    );
    const { container: caution } = render(
      <InteractionCard interaction={interaction("moderate")} />,
    );
    const { container: fine } = render(
      <InteractionCard interaction={interaction("mild")} />,
    );

    // Three actions, three shapes — the badge still separates the degree.
    expect(glyphOf(never)).not.toBe(glyphOf(caution));
    expect(glyphOf(caution)).not.toBe(glyphOf(fine));
    expect(glyphOf(never)).not.toBe(glyphOf(fine));
    expect(glyphOf(never)).not.toBe("");
  });

  it("hides the decorative glyph from assistive technology", () => {
    const { container } = render(
      <InteractionCard interaction={interaction("severe")} />,
    );
    expect(container.querySelector("svg.lucide")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("falls back to mild for an unrecognised severity", () => {
    render(<InteractionCard interaction={interaction("nonsense")} />);
    expect(screen.getByText("Mild")).toBeInTheDocument();
  });
});
