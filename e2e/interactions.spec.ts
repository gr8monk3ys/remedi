/**
 * E2E Tests for Drug Interaction Checker
 *
 * Tests the /interactions page including:
 * - Page loads correctly with heading and description
 * - Adding substances via input
 * - Removing substances from the list
 * - Validation (duplicate, minimum count, max limit)
 * - Checking interactions via API
 * - Displaying results (found interactions and no interactions)
 * - Expanding interaction details
 * - Medical disclaimer visibility
 * - Keyboard accessibility
 */

import { test, expect } from "@playwright/test";

test.describe("Drug Interaction Checker", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss onboarding modals
    await page.addInitScript(() => {
      localStorage.setItem("remedi_first_visit", "true");
      localStorage.setItem("remedi_tutorial_completed", "true");
    });
    await page.goto("/interactions");
  });

  test("should load the interactions page with correct heading", async ({
    page,
  }) => {
    await expect(page).toHaveTitle(/Drug Interaction Checker/i);

    const heading = page.getByRole("heading", {
      level: 1,
      name: /Drug Interaction Checker/i,
    });
    await expect(heading).toBeVisible();
  });

  test("should display the page description", async ({ page }) => {
    await expect(
      page.getByText(
        /Check for potential interactions between the medications/i,
      ),
    ).toBeVisible();
  });

  test("should have a substance input field", async ({ page }) => {
    const input = page.getByLabel(/Substance name/i);
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute(
      "placeholder",
      /Enter a medication or supplement name/i,
    );
  });

  test("should have an Add button", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /Add substance/i });
    await expect(addButton).toBeVisible();
    // Add button should be disabled when input is empty
    await expect(addButton).toBeDisabled();
  });

  test("should add a substance when clicking Add", async ({ page }) => {
    const input = page.getByLabel(/Substance name/i);
    const addButton = page.getByRole("button", { name: /Add substance/i });

    await input.fill("Aspirin");
    await expect(addButton).toBeEnabled();
    await addButton.click();

    // Substance should appear as a badge
    await expect(page.getByText("Aspirin")).toBeVisible();

    // Input should be cleared after adding
    await expect(input).toHaveValue("");
  });

  test("should add a substance by pressing Enter", async ({ page }) => {
    const input = page.getByLabel(/Substance name/i);

    await input.fill("Ibuprofen");
    await input.press("Enter");

    // Substance should appear as a badge
    await expect(page.getByText("Ibuprofen")).toBeVisible();
    await expect(input).toHaveValue("");
  });

  test("should add multiple substances", async ({ page }) => {
    const input = page.getByLabel(/Substance name/i);

    await input.fill("Aspirin");
    await input.press("Enter");

    await input.fill("Warfarin");
    await input.press("Enter");

    await input.fill("Ginkgo Biloba");
    await input.press("Enter");

    // All substances should be visible as badges
    await expect(page.getByText("Aspirin")).toBeVisible();
    await expect(page.getByText("Warfarin")).toBeVisible();
    await expect(page.getByText("Ginkgo Biloba")).toBeVisible();
  });

  test("should remove a substance when clicking the remove button", async ({
    page,
  }) => {
    const input = page.getByLabel(/Substance name/i);

    await input.fill("Aspirin");
    await input.press("Enter");

    // Verify it was added
    await expect(page.getByText("Aspirin")).toBeVisible();

    // Click the remove button for Aspirin
    const removeButton = page.getByRole("button", {
      name: /Remove Aspirin/i,
    });
    await removeButton.click();

    // Aspirin should no longer be visible (only check within substance badges area)
    // The substance badge with remove button should be gone
    await expect(removeButton).not.toBeVisible();
  });

  test("should prevent adding duplicate substances", async ({ page }) => {
    const input = page.getByLabel(/Substance name/i);

    await input.fill("Aspirin");
    await input.press("Enter");

    // Try to add the same substance again
    await input.fill("Aspirin");
    await input.press("Enter");

    // Error message should appear
    await expect(page.getByText(/already been added/i)).toBeVisible();
  });

  test("should show error when checking with fewer than 2 substances", async ({
    page,
  }) => {
    const input = page.getByLabel(/Substance name/i);

    await input.fill("Aspirin");
    await input.press("Enter");

    // The Check Interactions button should be disabled with only 1 substance
    const checkButton = page.getByRole("button", {
      name: /Check Interactions/i,
    });
    await expect(checkButton).toBeDisabled();
  });

  test("should enable Check Interactions button with 2+ substances", async ({
    page,
  }) => {
    const input = page.getByLabel(/Substance name/i);

    await input.fill("Aspirin");
    await input.press("Enter");

    await input.fill("Warfarin");
    await input.press("Enter");

    const checkButton = page.getByRole("button", {
      name: /Check Interactions/i,
    });
    await expect(checkButton).toBeEnabled();
  });

  test("should check interactions and show results", async ({ page }) => {
    // Mock the API to return interactions
    await page.route("**/api/interactions/check", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            interactions: [
              {
                id: "int-1",
                substanceA: "Aspirin",
                substanceAType: "drug",
                substanceB: "Warfarin",
                substanceBType: "drug",
                severity: "severe",
                description:
                  "Aspirin and Warfarin together increase the risk of bleeding.",
                mechanism: "Both substances inhibit blood clotting.",
                recommendation:
                  "Avoid concurrent use unless directed by physician.",
                evidence: "established",
                sources: ["FDA Drug Interaction Database"],
              },
            ],
            substancesChecked: ["Aspirin", "Warfarin"],
            pairsChecked: 1,
            interactionsFound: 1,
          },
        }),
      });
    });

    const input = page.getByLabel(/Substance name/i);

    await input.fill("Aspirin");
    await input.press("Enter");

    await input.fill("Warfarin");
    await input.press("Enter");

    const checkButton = page.getByRole("button", {
      name: /Check Interactions/i,
    });
    await checkButton.click();

    // Wait for the results to appear
    // Summary line should show the results
    await expect(page.getByText(/1 interaction/i)).toBeVisible({
      timeout: 5000,
    });

    // Interaction card should show the substances
    await expect(page.getByText("Aspirin + Warfarin")).toBeVisible();

    // Severity badge should be visible
    await expect(page.getByText("Severe")).toBeVisible();

    // Description should be visible
    await expect(
      page.getByText(/increase the risk of bleeding/i),
    ).toBeVisible();
  });

  test("should show no interactions found message", async ({ page }) => {
    // Mock the API to return no interactions
    await page.route("**/api/interactions/check", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            interactions: [],
            substancesChecked: ["Aspirin", "Vitamin C"],
            pairsChecked: 1,
            interactionsFound: 0,
          },
        }),
      });
    });

    const input = page.getByLabel(/Substance name/i);

    await input.fill("Aspirin");
    await input.press("Enter");

    await input.fill("Vitamin C");
    await input.press("Enter");

    const checkButton = page.getByRole("button", {
      name: /Check Interactions/i,
    });
    await checkButton.click();

    // Should show the "No Known Interactions Found" card
    await expect(
      page.getByRole("heading", { name: /No Known Interactions Found/i }),
    ).toBeVisible({ timeout: 5000 });

    // Should also show the summary
    await expect(
      page.getByText(/No known interactions found in our database/i),
    ).toBeVisible();
  });

  test("should expand interaction details when clicking expand button", async ({
    page,
  }) => {
    // Mock the API with full interaction data
    await page.route("**/api/interactions/check", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            interactions: [
              {
                id: "int-1",
                substanceA: "Aspirin",
                substanceAType: "drug",
                substanceB: "Warfarin",
                substanceBType: "drug",
                severity: "severe",
                description: "Increased bleeding risk.",
                mechanism: "Both inhibit clotting pathways.",
                recommendation: "Avoid concurrent use.",
                evidence: "established",
                sources: ["FDA Database", "PubMed Central"],
              },
            ],
            substancesChecked: ["Aspirin", "Warfarin"],
            pairsChecked: 1,
            interactionsFound: 1,
          },
        }),
      });
    });

    const input = page.getByLabel(/Substance name/i);
    await input.fill("Aspirin");
    await input.press("Enter");
    await input.fill("Warfarin");
    await input.press("Enter");

    await page.getByRole("button", { name: /Check Interactions/i }).click();

    // Wait for results
    await expect(page.getByText("Aspirin + Warfarin")).toBeVisible({
      timeout: 5000,
    });

    // Click the expand button to show details
    const expandButton = page.getByRole("button", {
      name: /Expand details/i,
    });
    await expandButton.click();

    // Now mechanism, recommendation, and sources should be visible
    await expect(page.getByText("Mechanism")).toBeVisible();
    await expect(
      page.getByText(/Both inhibit clotting pathways/i),
    ).toBeVisible();
    await expect(page.getByText("Recommendation")).toBeVisible();
    await expect(page.getByText(/Avoid concurrent use/i)).toBeVisible();
    await expect(page.getByText("Sources")).toBeVisible();

    // Click collapse
    const collapseButton = page.getByRole("button", {
      name: /Collapse details/i,
    });
    await collapseButton.click();

    // Mechanism section should no longer be visible
    await expect(page.getByText("Mechanism")).not.toBeVisible();
  });

  test("should show loading state when checking interactions", async ({
    page,
  }) => {
    // Delay the API response to observe loading state
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

    const input = page.getByLabel(/Substance name/i);
    await input.fill("Aspirin");
    await input.press("Enter");
    await input.fill("Warfarin");
    await input.press("Enter");

    await page.getByRole("button", { name: /Check Interactions/i }).click();

    // Button should show "Checking..." text during loading
    await expect(page.getByText("Checking...")).toBeVisible({ timeout: 1000 });
  });

  test("should handle API errors gracefully", async ({ page }) => {
    await page.route("**/api/interactions/check", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: { message: "Failed to check interactions." },
        }),
      });
    });

    const input = page.getByLabel(/Substance name/i);
    await input.fill("Aspirin");
    await input.press("Enter");
    await input.fill("Warfarin");
    await input.press("Enter");

    await page.getByRole("button", { name: /Check Interactions/i }).click();

    // Error alert should appear
    await expect(page.getByText(/Failed to check interactions/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should display the medical disclaimer", async ({ page }) => {
    await expect(page.getByText(/Important Medical Disclaimer/i)).toBeVisible();

    await expect(
      page.getByText(
        /informational purposes only and is not a substitute for professional medical advice/i,
      ),
    ).toBeVisible();
  });

  test("should be keyboard accessible", async ({ page }) => {
    const input = page.getByLabel(/Substance name/i);

    // Focus on substance input
    await input.focus();
    const isFocused = await input.evaluate(
      (el) => el === document.activeElement,
    );
    expect(isFocused).toBeTruthy();

    // Type and submit via keyboard
    await page.keyboard.type("Aspirin");
    await page.keyboard.press("Enter");

    // Substance should be added
    await expect(page.getByText("Aspirin")).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/interactions");

    // Core page text should still be visible on small screens.
    await expect(
      page.getByText("Drug Interaction Checker").first(),
    ).toBeVisible({
      timeout: 10000,
    });

    // Input and Add button should be accessible
    await expect(page.getByLabel(/Substance name/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Add substance/i }),
    ).toBeVisible();
  });
});
