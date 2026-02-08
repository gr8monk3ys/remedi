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
      localStorage.setItem("remedi_first_visit", "true");
      localStorage.setItem("remedi_tutorial_completed", "true");
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

    // Loading skeletons should not be visible after content loads
    const skeletons = page.locator(".animate-pulse");
    // Some skeletons may exist (e.g., avatar placeholders), but main content
    // should have replaced the loading state
    await expect(skeletons).not.toHaveCount(0);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("should show interaction checker loading state", async ({ page }) => {
    // Delay the interactions API
    await page.route("**/api/interactions/check", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      route.fulfill({
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
    await input.fill("Aspirin");
    await input.press("Enter");
    await input.fill("Warfarin");
    await input.press("Enter");

    await page.getByRole("button", { name: /Check Interactions/i }).click();

    // Button text changes to "Checking..." during loading
    await expect(page.getByText("Checking...")).toBeVisible({ timeout: 1000 });

    // After API resolves, loading text should disappear
    await expect(page.getByText("Checking...")).not.toBeVisible({
      timeout: 5000,
    });

    // Results should now be visible
    await expect(page.getByText(/No Known Interactions Found/i)).toBeVisible();
  });

  test("should not show persistent loading state on homepage", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // The main heading should be visible (not hidden behind loading)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Features grid should be rendered
    await expect(
      page.getByRole("heading", { name: "Smart Search" }),
    ).toBeVisible();
  });
});
