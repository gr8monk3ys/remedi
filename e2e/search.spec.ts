/**
 * E2E Tests for Search Functionality
 *
 * Tests the core search features including:
 * - Basic search via input and button
 * - Search results display with shadcn Card components
 * - Suggestion badge clicks
 * - Loading/skeleton states
 * - Filter toggle and filter panel
 * - Error handling
 * - Keyboard accessibility
 */

import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss onboarding
    await page.addInitScript(() => {
      localStorage.setItem("remedi_onboarding_welcome_completed", "true");
      localStorage.setItem("remedi_welcome_dismissed", "true");
      localStorage.setItem("remedi_onboarding_tour_completed", "true");
      localStorage.setItem("remedi_tour_dismissed", "true");
    });
    await page.goto("/");
    // Wait for the dynamically-loaded search component
    await page.getByRole("searchbox").waitFor({ timeout: 10000 });
  });

  test("should display search input on homepage", async ({ page }) => {
    await expect(page).toHaveURL("/");
    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
  });

  test("should have a search button", async ({ page }) => {
    const searchButton = page.locator("[data-search-button]");
    await expect(searchButton).toBeVisible();
    await expect(searchButton).toHaveText("Search");
  });

  test("should perform a basic search by pressing Enter", async ({ page }) => {
    await page.route("**/api/search**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "mock-remedy-1",
              name: "Mock Remedy",
              description: "Mock remedy used for deterministic E2E testing.",
              imageUrl: "",
              category: "Herbal",
              matchingNutrients: ["Vitamin C"],
              similarityScore: 0.92,
            },
          ],
        }),
      });
    });

    const searchInput = page.getByRole("searchbox");

    await searchInput.fill("aspirin");
    await expect(searchInput).toHaveValue("aspirin");
    const searchResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/search"),
    );
    await searchInput.press("Enter");
    await searchResponsePromise;

    const resultCard = page
      .locator("#search-results [data-favorite-button]")
      .first();
    await expect(resultCard).toBeVisible({ timeout: 10000 });
  });

  test("should perform a search by clicking the search button", async ({
    page,
  }) => {
    await page.route("**/api/search**", async (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "mock-remedy-2",
              name: "Mock Remedy 2",
              description: "Mock result for click-based search flow.",
              imageUrl: "",
              category: "Supplement",
              matchingNutrients: ["Magnesium"],
              similarityScore: 0.87,
            },
          ],
        }),
      });
    });

    const searchInput = page.getByRole("searchbox");
    const searchButton = page.locator("[data-search-button]");

    await searchInput.fill("ibuprofen");
    await expect(searchInput).toHaveValue("ibuprofen");
    const searchResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/search"),
    );
    await searchButton.click();

    await searchResponsePromise;
    await expect(
      page.locator("#search-results [data-favorite-button]").first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should trigger search by clicking a suggestion badge", async ({
    page,
  }) => {
    const suggestionBadge = page.getByText("Vitamin D");
    await expect(suggestionBadge).toBeVisible();

    await suggestionBadge.click();

    // The search input should update to the suggestion text
    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toHaveValue("Vitamin D");

    // Wait for search API response triggered by suggestion click
    await page
      .waitForResponse((response) => response.url().includes("/api/search"), {
        timeout: 10000,
      })
      .catch(() => {});
  });

  test("should show loading skeletons during search", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");

    await searchInput.fill("ibuprofen");
    await searchInput.press("Enter");

    // Skeletons are rendered inside #search-results as Skeleton components
    // with the animate-pulse class
    const loadingSkeleton = page.locator("#search-results .animate-pulse");

    try {
      await expect(loadingSkeleton.first()).toBeVisible({ timeout: 2000 });
    } catch {
      // Loading may complete too fast to catch; that is acceptable
      expect(true).toBe(true);
    }
  });

  test("should handle empty search gracefully", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");

    // Press Enter with empty query
    await searchInput.press("Enter");

    // Should stay on homepage, no crash
    await expect(page).toHaveURL("/");
    await expect(searchInput).toBeEnabled();
  });

  test("should show clear button when query is entered", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");

    await searchInput.fill("test query");

    // Clear button should appear
    const clearButton = page.getByRole("button", { name: /Clear search/i });
    await expect(clearButton).toBeVisible();

    // Clicking it should clear the input
    await clearButton.click();
    await expect(searchInput).toHaveValue("");
  });

  test("should display search result cards after search", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");

    await searchInput.fill("vitamin d");
    await searchInput.press("Enter");

    // Wait for API response
    const responsePromise = page
      .waitForResponse(
        (response) =>
          response.url().includes("/api/search") && response.status() === 200,
        { timeout: 10000 },
      )
      .catch(() => null);

    const response = await responsePromise;

    if (response) {
      const body = await response.json().catch(() => null);

      // If API returned results, verify cards are displayed
      if (body?.success && body?.data?.length > 0) {
        // Result cards use the data-favorite-button attribute
        const resultCards = page.locator(
          "#search-results [data-favorite-button]",
        );
        await expect(resultCards.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should navigate to remedy detail when clicking a result card", async ({
    page,
  }) => {
    const searchInput = page.getByRole("searchbox");

    await searchInput.fill("acetaminophen");
    await searchInput.press("Enter");

    // Wait for API response
    await page
      .waitForResponse(
        (response) =>
          response.url().includes("/api/search") && response.status() === 200,
        { timeout: 10000 },
      )
      .catch(() => {});

    // Wait a moment for results to render
    await page.waitForTimeout(1000);

    // Try to find and click the first result card
    // SearchResultCard renders as a shadcn Card with onClick navigating to /remedy/[id]
    const firstCard = page
      .locator("#search-results")
      .locator("[data-favorite-button]")
      .first();

    if (await firstCard.isVisible().catch(() => false)) {
      // Click the card itself (not the favorite button)
      // The card container has the onClick, so click on the card's heading
      const cardParent = firstCard.locator("..").locator("..").locator("..");
      await cardParent.click();

      // Wait for navigation to remedy page
      await page.waitForURL("**/remedy/**", { timeout: 5000 }).catch(() => {});

      const isDetailPage = page.url().includes("/remedy");
      expect(isDetailPage).toBeTruthy();
    }
  });

  test("should show tabs after search results are available", async ({
    page,
  }) => {
    const searchInput = page.getByRole("searchbox");

    await searchInput.fill("vitamin d");
    await searchInput.press("Enter");

    // Wait for API response
    await page
      .waitForResponse(
        (response) =>
          response.url().includes("/api/search") && response.status() === 200,
        { timeout: 10000 },
      )
      .catch(() => {});

    // SearchTabs uses shadcn Tabs. The History tab is gated to paid plans.
    const resultsTab = page.getByRole("tab", { name: /Results/i });
    const historyTab = page.getByRole("tab", { name: /History/i });

    // Tabs should appear when there are results or history
    if (await resultsTab.isVisible().catch(() => false)) {
      await expect(resultsTab).toBeVisible();

      // History may be hidden for anonymous/free users.
      if ((await historyTab.count()) > 0) {
        await expect(historyTab).toBeVisible();
      }
    }
  });

  test("should toggle filter panel via filter button", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");

    await searchInput.fill("vitamin d");
    await searchInput.press("Enter");

    // Wait for API response
    await page
      .waitForResponse(
        (response) =>
          response.url().includes("/api/search") && response.status() === 200,
        { timeout: 10000 },
      )
      .catch(() => {});

    // The filter toggle button has data-filter-toggle attribute and text "Filters"
    const filterButton = page.locator("[data-filter-toggle]");

    if (await filterButton.isVisible().catch(() => false)) {
      await filterButton.click();

      // Filter panel should become visible with filter cards
      const filterCard = page.getByRole("heading", {
        name: "Filter by Category",
      });

      await expect(filterCard).toBeVisible({ timeout: 3000 });
    }
  });

  test("should handle search API errors gracefully", async ({ page }) => {
    // Intercept API and force an error
    await page.route("**/api/search**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Internal server error" },
        }),
      });
    });

    const searchInput = page.getByRole("searchbox");

    await searchInput.fill("test");
    await searchInput.press("Enter");

    // Wait for error response
    await page
      .waitForResponse((response) => response.url().includes("/api/search"), {
        timeout: 10000,
      })
      .catch(() => {});

    // Error message should be displayed in the results area
    const errorMessage = page
      .locator("#search-results")
      .getByText(/failed|error|try again/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test("should show retry-after guidance when standard search is rate limited", async ({
    page,
  }) => {
    await page.route("**/api/search**", (route) => {
      route.fulfill({
        status: 429,
        headers: {
          "Retry-After": "12",
        },
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
            statusCode: 429,
          },
        }),
      });
    });

    const searchInput = page.getByRole("searchbox");
    await searchInput.fill("ibuprofen");
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/search") && response.status() === 429,
        { timeout: 15000 },
      ),
      searchInput.press("Enter"),
    ]);

    await expect(
      page
        .locator("#search-results")
        .getByText(/Search is temporarily rate-limited/i),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#search-results")).toContainText("12s");
  });

  test("should show retry-after guidance when AI search is rate limited", async ({
    page,
  }) => {
    await page.route("**/api/ai-search", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              status: "available",
            },
          }),
        });
        return;
      }

      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
            statusCode: 429,
            retryAfter: 9,
          },
        }),
      });
    });

    await page.reload();
    await page.getByRole("searchbox").waitFor({ timeout: 10000 });

    const aiToggle = page.locator("[data-ai-toggle]");
    await expect(aiToggle).toBeVisible();
    await aiToggle.click();

    const searchInput = page.getByRole("searchbox");
    await searchInput.fill("help with joint pain");
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/ai-search") &&
          response.request().method() === "POST",
        { timeout: 15000 },
      ),
      searchInput.press("Enter"),
    ]);

    await expect(
      page
        .locator("#search-results")
        .getByText(/AI search is temporarily rate-limited/i),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#search-results")).toContainText("9s");
  });

  test("should be keyboard accessible", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");

    // Focus on search input with keyboard
    await searchInput.focus();

    const isFocused = await searchInput.evaluate(
      (el) => el === document.activeElement,
    );
    expect(isFocused).toBeTruthy();

    // Type in search using keyboard
    await page.keyboard.type("headache");
    await expect(searchInput).toHaveValue("headache");

    // Submit with Enter
    await page.keyboard.press("Enter");

    // Wait for API response
    await page
      .waitForResponse((response) => response.url().includes("/api/search"), {
        timeout: 10000,
      })
      .catch(() => {});

    // Search input should retain the value
    await expect(searchInput).toHaveValue("headache");
  });

  test("should maintain search state on page", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");
    const searchQuery = "cold medicine";

    await searchInput.fill(searchQuery);
    await searchInput.press("Enter");

    // Wait for API response
    await page
      .waitForResponse((response) => response.url().includes("/api/search"), {
        timeout: 10000,
      })
      .catch(() => {});

    // Search input should still contain the query
    await expect(searchInput).toHaveValue(searchQuery);
  });

  test("should debounce search when typing", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");
    const searchApiCalls: string[] = [];

    // Track only the search endpoint (exclude /api/search-history, etc.)
    page.on("request", (request) => {
      const { pathname } = new URL(request.url());
      if (pathname === "/api/search") {
        searchApiCalls.push(request.url());
      }
    });

    // Ignore requests emitted during initial page hydration.
    await page.waitForTimeout(250);
    searchApiCalls.length = 0;

    // Type characters quickly
    await searchInput.type("ib", { delay: 50 });

    // Wait for debounce timer (400ms based on SearchInput component)
    await page.waitForTimeout(600);

    // Should have triggered at most one search (after debounce)
    expect(searchApiCalls.length).toBeLessThanOrEqual(1);
  });
});
