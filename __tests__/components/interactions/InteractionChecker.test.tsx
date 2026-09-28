/**
 * An interaction check answers for the list it was run against. Once that list
 * changes, its all-clear must not stay on screen under substances nobody
 * checked, and a response still in flight must not land on the new list.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InteractionChecker } from "@/components/interactions/InteractionChecker";

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
  } as unknown as Response;
}

const EMPTY_CHECK = {
  success: true,
  data: {
    interactions: [],
    substancesChecked: ["Ibuprofen", "Ginger"],
    pairsChecked: 1,
    interactionsFound: 0,
  },
};

async function addSubstance(name: string) {
  await userEvent.type(screen.getByLabelText("Substance name"), name);
  await userEvent.click(screen.getByRole("button", { name: "Add substance" }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("InteractionChecker", () => {
  it("clears an all-clear when a substance is added after the check", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(EMPTY_CHECK));
    render(<InteractionChecker />);

    await addSubstance("Ibuprofen");
    await addSubstance("Ginger");
    await userEvent.click(
      screen.getByRole("button", { name: /Check Interactions/i }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /No Known Interactions Found/i }),
      ).toBeInTheDocument(),
    );

    await addSubstance("Warfarin");

    expect(
      screen.queryByRole("heading", { name: /No Known Interactions Found/i }),
    ).not.toBeInTheDocument();
  });

  it("discards a response for a list that changed while it was in flight", async () => {
    let resolveCheck: (value: Response) => void = () => {};
    global.fetch = vi.fn().mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveCheck = resolve;
      }),
    );
    render(<InteractionChecker />);

    await addSubstance("Ibuprofen");
    await addSubstance("Ginger");
    await userEvent.click(
      screen.getByRole("button", { name: /Check Interactions/i }),
    );
    await addSubstance("Warfarin");

    resolveCheck(jsonResponse(EMPTY_CHECK));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Check Interactions/i }),
      ).toBeEnabled(),
    );
    expect(
      screen.queryByRole("heading", { name: /No Known Interactions Found/i }),
    ).not.toBeInTheDocument();
  });
});
