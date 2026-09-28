/**
 * ReviewsList recovers from a failed load: once a retry succeeds, the error
 * screen gives way to the reviews.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewsList } from "@/components/remedy/ReviewsList";

function jsonResponse(body: unknown): Response {
  return { json: async () => body } as unknown as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ReviewsList", () => {
  it("clears the error once a retry succeeds", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ success: false, error: { message: "Server down" } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            reviews: [],
            total: 0,
            page: 1,
            totalPages: 0,
            averageRating: 0,
            totalReviews: 0,
          },
        }),
      );

    render(<ReviewsList remedyId="r1" />);
    await waitFor(() =>
      expect(screen.getByText("Server down")).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() =>
      expect(screen.queryByText("Server down")).not.toBeInTheDocument(),
    );
  });

  it("encodes the remedy id into the request", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ success: false, error: { message: "x" } }),
      );

    render(<ReviewsList remedyId="a&b" />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(vi.mocked(global.fetch).mock.calls[0][0]).toContain(
      "remedyId=a%26b",
    );
  });
});
