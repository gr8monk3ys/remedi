import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useContributionForm } from "@/components/remedy/contribution-form/useContributionForm";

describe("useContributionForm references", () => {
  it("updates the field of an existing reference", () => {
    const { result } = renderHook(() => useContributionForm());

    act(() => result.current.setReference(0, "title", "A study"));

    expect(result.current.state.references[0]?.title).toBe("A study");
  });

  it("ignores an edit to a reference that does not exist", () => {
    const { result } = renderHook(() => useContributionForm());
    const before = result.current.state.references;

    act(() => result.current.setReference(before.length, "title", "ghost"));

    expect(result.current.state.references).toEqual(before);
  });
});
