/**
 * A policy refusal must reach the person searching.
 *
 * Anticoagulants and SSRIs carry no Remedy Mappings on purpose. Until the
 * search response grew a field to say so, that arrived as an empty list and
 * rendered as "No results found for warfarin" — indistinguishable from "we
 * looked and there is nothing", which is the confusion the mapping policy
 * exists to prevent.
 *
 * This covers the hand-off no unit test reaches: route to client to screen.
 */

import { test, expect } from "@playwright/test";

test.describe("search states its refusals", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("remedi_onboarding_welcome_completed", "true");
      localStorage.setItem("remedi_welcome_dismissed", "true");
      localStorage.setItem("remedi_onboarding_tour_completed", "true");
      localStorage.setItem("remedi_tour_dismissed", "true");
    });
  });

  test("a refused drug reads as a decision, not an empty result", async ({
    page,
  }) => {
    await page.goto("/");

    const searchInput = page.getByRole("searchbox");
    await searchInput.waitFor({ timeout: 15000 });
    await searchInput.fill("warfarin");
    await searchInput.press("Enter");

    await expect(
      page.getByText(/No matches are offered for this search/i),
    ).toBeVisible({ timeout: 20000 });

    // The reason, not merely the fact.
    await expect(page.getByText(/bleeding risk/i)).toBeVisible();

    // And never the generic empty state.
    await expect(page.getByText(/No results found for/i)).toHaveCount(0);
  });
});
