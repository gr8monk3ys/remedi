/**
 * Tests for MedicationCabinetList.
 *
 * The property under test: a failed cabinet interaction check must be visible.
 * This component used to swallow every failure, so a 401, a 403 plan gate or a
 * 500 all rendered exactly like a clean result over a user's real medication
 * list.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MedicationCabinetList } from "@/components/dashboard/MedicationCabinetList";

const MEDICATIONS = [
  {
    id: "1",
    name: "Warfarin",
    type: "pharmaceutical",
    dosage: null,
    frequency: null,
    startDate: null,
    notes: null,
    isActive: true,
  },
  {
    id: "2",
    name: "St. John's Wort",
    type: "natural_remedy",
    dosage: null,
    frequency: null,
    startDate: null,
    notes: null,
    isActive: true,
  },
];

function respondWith(body: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
  } as unknown as Response);
}

async function clickCheck() {
  await userEvent.click(
    screen.getByRole("button", { name: /Check Interactions/i }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MedicationCabinetList interaction check", () => {
  it("surfaces a server failure instead of showing nothing", async () => {
    respondWith({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "boom", statusCode: 500 },
    });

    render(<MedicationCabinetList initialMedications={MEDICATIONS} />);
    await clickCheck();

    await waitFor(() =>
      expect(
        screen.getByText(/Interaction check unavailable/i),
      ).toBeInTheDocument(),
    );
  });

  it("surfaces the plan gate rather than an empty result", async () => {
    respondWith({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Cabinet interaction checking requires a Basic plan or higher",
        statusCode: 403,
      },
    });

    render(<MedicationCabinetList initialMedications={MEDICATIONS} />);
    await clickCheck();

    await waitFor(() =>
      expect(
        screen.getByText(/Interaction checking needs a paid plan/i),
      ).toBeInTheDocument(),
    );
  });

  it("reports a genuine empty result as a checked result", async () => {
    respondWith({ success: true, data: { interactions: [], count: 0 } });

    render(<MedicationCabinetList initialMedications={MEDICATIONS} />);
    await clickCheck();

    await waitFor(() =>
      expect(
        screen.getByText(/No known interactions were found/i),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/Interaction check unavailable/i),
    ).not.toBeInTheDocument();
  });

  it("renders the interactions it finds", async () => {
    respondWith({
      success: true,
      data: {
        interactions: [
          {
            id: "1",
            substanceA: "Warfarin",
            substanceAType: "pharmaceutical",
            substanceB: "St. John's Wort",
            substanceBType: "natural_remedy",
            severity: "severe",
            description: "Reduces anticoagulant effect.",
            mechanism: null,
            recommendation: null,
            evidence: "established",
            sources: [],
          },
        ],
        count: 1,
      },
    });

    render(<MedicationCabinetList initialMedications={MEDICATIONS} />);
    await clickCheck();

    await waitFor(() =>
      expect(screen.getByText(/Interaction Alerts/i)).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/Reduces anticoagulant effect/i),
    ).toBeInTheDocument();
  });
});
