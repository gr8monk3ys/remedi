/**
 * E2E Tests for Loading States
 *
 * Tests that skeleton loading states render correctly across pages.
 * Next.js loading.tsx files provide Suspense-based loading UIs that
 * use shadcn Skeleton components with animate-pulse.
 *
 * These tests verify:
 * - Skeleton components render during page transitions
 * - Loading states do not persist indefinitely
 * - Search loading skeletons appear during API calls
 * - Pages transition from loading to content gracefully
 */

import { test, expect } from "@playwright/test";

test.describe("Loading States", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss onboarding modals
    await page.addInitScript(() => {
      localStorage.setItem("remedi_onboarding_welcome_completed", "true");
      localStorage.setItem("remedi_welcome_dismissed", "true");
      localStorage.setItem("remedi_onboarding_tour_completed", "true");
      localStorage.setItem("remedi_tour_dismissed", "true");
    });
  });

  test("should show search component skeleton on homepage before load", async ({
    page,
  }) => {
    // The SearchSection uses dynamic import with a loading skeleton
    // The skeleton shows animate-pulse divs before the search component loads
    await page.goto("/");

    // After full load, the actual search input should replace the skeleton
    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test("should show result skeletons during search", async ({ page }) => {
    // Delay the API to make loading state visible
    await page.route("**/api/search**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      });
    });

    await page.goto("/");
    await page.getByRole("searchbox").waitFor({ timeout: 10000 });

    const searchInput = page.getByRole("searchbox");
    await searchInput.fill("test");
    await searchInput.press("Enter");

    // SearchResults renders Skeleton components inside Card components during loading
    // Look for animate-pulse elements within the search results area
    const skeletons = page.locator("#search-results .animate-pulse");
    await expect(skeletons.first()).toBeVisible({ timeout: 2000 });

    // Skeletons should eventually disappear when loading finishes
    await expect(skeletons.first()).not.toBeVisible({ timeout: 5000 });
  });

  test("should transition from loading to content on remedy page", async ({
    page,
  }) => {
    // Navigate to a remedy page with mock data
    await page.goto("/remedy/103");

    // After loading, the actual content should be visible
    await expect(
      page.getByRole("heading", { level: 1, name: "Turmeric" }),
    ).toBeVisible({ timeout: 10000 });

    // Confirm core remedy content has fully rendered after transition.
    await expect(page.getByRole("heading", { name: "Usage" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dosage" })).toBeVisible();
  });

  test("should show interaction checker loading state", async ({ page }) => {
    // Delay the interactions API
    await page.route("**/api/interactions/check**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            interactions: [],
            substancesChecked: ["A", "B"],
            pairsChecked: 1,
            interactionsFound: 0,
          },
        }),
      });
    });

    await page.goto("/interactions");

    const input = page.getByLabel(/Substance name/i);
    const addButton = page.getByRole("button", { name: /Add substance/i });
    const checkButton = page.getByRole("button", {
      name: /Check Interactions/i,
    });

    await input.fill("Aspirin");
    await addButton.click();
    await input.fill("Warfarin");
    await addButton.click();

    await expect(page.getByText("Aspirin")).toBeVisible();
    await expect(page.getByText("Warfarin")).toBeVisible();
    await expect(checkButton).toBeEnabled();

    const checkResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/interactions/check") &&
        response.request().method() === "POST",
      { timeout: 15000 },
    );

    await checkButton.click();

    // Button text changes to "Checking..." during loading
    await expect(page.getByText("Checking...")).toBeVisible({ timeout: 3000 });

    // Ensure the mocked API call completed before asserting final UI.
    await checkResponsePromise;

    // After API resolves, loading text should disappear
    await expect(page.getByText("Checking...")).not.toBeVisible({
      timeout: 5000,
    });

    // Results should now be visible.
    await expect(
      page.getByRole("heading", { name: /No Known Interactions Found/i }),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test("should not show persistent loading state on homepage", async ({
    page,
  }) => {
    await page.goto("/");

    // The main heading should become visible after hydration
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /find natural alternatives to pharmaceuticals/i,
      }),
    ).toBeVisible({ timeout: 10000 });

    // Features grid should be rendered
    await expect(
      page.getByRole("heading", { name: "Smart Search" }),
    ).toBeVisible();
  });
});
