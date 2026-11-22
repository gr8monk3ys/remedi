import { fromPartial } from "@total-typescript/shoehorn";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileComparisonSwiper } from "@/components/compare/MobileComparisonSwiper";

type CompareRemedy = Parameters<
  typeof MobileComparisonSwiper
>[0]["remedies"][number];

const remedy = (id: string, name: string) =>
  fromPartial<CompareRemedy>({ id, name, references: [] });

describe("MobileComparisonSwiper", () => {
  it("renders nothing when there are no remedies", () => {
    const { container } = render(
      <MobileComparisonSwiper remedies={[]} onRemoveRemedy={() => {}} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing, rather than crashing, when the shown remedy is removed", async () => {
    const remedies = [remedy("1", "Ginger"), remedy("2", "Turmeric")];
    const { container, rerender } = render(
      <MobileComparisonSwiper remedies={remedies} onRemoveRemedy={() => {}} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Next remedy" }));

    rerender(
      <MobileComparisonSwiper
        remedies={remedies.slice(0, 1)}
        onRemoveRemedy={() => {}}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
