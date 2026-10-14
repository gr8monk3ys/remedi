/**
 * ReportViewer renders the content `lib/ai/report-generator.ts` stores.
 *
 * The viewer used to read a shape nobody writes (`substance`/`medication`,
 * `description`/`precautions`, `{ title }` sources), so every interaction
 * warning rendered as " + " and every remedy lost its warnings.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportViewer } from "@/components/reports/ReportViewer";

function reportWith(content: Record<string, unknown>) {
  return {
    id: "r1",
    title: "Report",
    queryType: "condition",
    queryInput: "sleep",
    content,
    status: "completed",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  };
}

describe("ReportViewer", () => {
  it("names both substances of a cabinet interaction and its recommendation", () => {
    render(
      <ReportViewer
        report={reportWith({
          interactionCheck: "checked",
          interactionWarnings: [
            {
              substanceA: "Warfarin",
              substanceB: "Ginkgo",
              severity: "severe",
              description: "Raises bleeding risk.",
              recommendation: "Avoid the combination.",
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("Warfarin + Ginkgo")).toBeInTheDocument();
    expect(screen.getByText("Severe")).toBeInTheDocument();
    expect(screen.getByText("Avoid the combination.")).toBeInTheDocument();
  });

  it("shows a recommendation's reasoning and warnings", () => {
    render(
      <ReportViewer
        report={reportWith({
          recommendations: [
            {
              name: "Valerian",
              category: "Herb",
              evidenceLevel: "Moderate",
              reasoning: "Studied for sleep latency.",
              dosage: "300 mg",
              warnings: ["May cause drowsiness"],
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("Studied for sleep latency.")).toBeInTheDocument();
    expect(screen.getByText("May cause drowsiness")).toBeInTheDocument();
  });

  it("renders plain-string sources", () => {
    render(
      <ReportViewer report={reportWith({ sources: ["Remedi Database"] })} />,
    );

    expect(screen.getByText("Remedi Database")).toBeInTheDocument();
  });

  it("says the interaction check failed rather than omitting the section", () => {
    render(
      <ReportViewer
        report={reportWith({
          interactionCheck: "unavailable",
          interactionWarnings: [],
        })}
      />,
    );

    expect(
      screen.getByText(/could not check your medication cabinet/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/no known interactions/i)).toBeNull();
  });

  it("states a checked, empty cabinet as no known interactions", () => {
    render(
      <ReportViewer
        report={reportWith({
          interactionCheck: "checked",
          interactionWarnings: [],
        })}
      />,
    );

    expect(screen.getByText(/no known interactions/i)).toBeInTheDocument();
  });
});
