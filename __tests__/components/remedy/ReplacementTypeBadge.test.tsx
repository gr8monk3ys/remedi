/**
 * The claim-limiting label must reach every reader, not just a mouse.
 *
 * "Supportive" alone does not carry the caveat — the sentence that turns it
 * into "not a substitute for this medication" does. That sentence used to live
 * in a `title` attribute only, which does not appear on touch, is not
 * reachable by keyboard, and is announced inconsistently.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReplacementTypeBadge } from "@/components/remedy/ReplacementTypeBadge";

describe("ReplacementTypeBadge", () => {
  it("names the relationship in text", () => {
    render(<ReplacementTypeBadge type="Supportive" />);
    expect(screen.getByText("Supportive")).toBeInTheDocument();
  });

  it("carries the caveat in the accessible name, not only in a tooltip", () => {
    render(<ReplacementTypeBadge type="Supportive" />);
    const badge = screen.getByLabelText(
      /not a substitute for this medication/i,
    );
    expect(badge).toBeInTheDocument();
    // Still present for sighted mouse users.
    expect(badge).toHaveAttribute("title");
  });

  it("warns against stopping a prescription on the Alternative label", () => {
    render(<ReplacementTypeBadge type="Alternative" />);
    expect(
      screen.getByLabelText(/never stop or change a prescribed medication/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/not a replacement for this medication/i),
    ).toBeInTheDocument();
  });

  it("never shows the word Alternative to the reader", () => {
    // The stored value is "Alternative"; the reader sees "Similar use". The
    // stored word reads as "use this instead of your prescription".
    render(<ReplacementTypeBadge type="Alternative" />);
    expect(screen.getByText("Similar use")).toBeInTheDocument();
    expect(screen.queryByText(/alternative/i)).not.toBeInTheDocument();
    for (const type of ["Alternative", "Complementary", "Supportive"]) {
      const { container, unmount } = render(
        <ReplacementTypeBadge type={type} />,
      );
      expect(container.innerHTML).not.toMatch(/alternative/i);
      unmount();
    }
  });

  it("renders nothing rather than guessing when the label is missing", () => {
    // A caller that gets nothing back must not render a bare score either.
    const { container } = render(<ReplacementTypeBadge type={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a value outside the vocabulary", () => {
    const { container } = render(<ReplacementTypeBadge type="Substitute" />);
    expect(container).toBeEmptyDOMElement();
  });
});
