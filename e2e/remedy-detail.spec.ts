/**
 * E2E Tests for Remedy Detail Page
 *
 * Tests the /remedy/[id] page including:
 * - Page loads with remedy information
 * - Displays usage, dosage, precautions sections
 * - Shows scientific information and references
 * - Related remedies sidebar
 * - Back navigation button
 * - Favorite toggle
 * - Medical disclaimer
 * - 404 handling for non-existent remedies
 */

import { test, expect } from "@playwright/test";

test.describe("Remedy Detail Page", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss onboarding modals
    await page.addInitScript(() => {
      localStorage.setItem("remedi_first_visit", "true");
      localStorage.setItem("remedi_tutorial_completed", "true");
    });
  });

  test("should load a remedy detail page with mock data", async ({ page }) => {
    // Navigate to a known mock remedy (ID 103 = Turmeric)
    await page.goto("/remedy/103");

    // Should display the remedy name as heading
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("Turmeric");
  });

  test("should display the remedy category badge", async ({ page }) => {
    await page.goto("/remedy/103");

    // Category badge (Herbal Remedy)
    await expect(page.getByText("Herbal Remedy")).toBeVisible();
  });

  test("should display the remedy description", async ({ page }) => {
    await page.goto("/remedy/103");

    await expect(page.getByText(/anti-inflammatory properties/i)).toBeVisible();
  });

  test("should display match score", async ({ page }) => {
    await page.goto("/remedy/103");

    // Match Score label and percentage
    await expect(page.getByText("Match Score")).toBeVisible();
    await expect(page.getByText("85%")).toBeVisible();
  });

  test("should display matching nutrients", async ({ page }) => {
    await page.goto("/remedy/103");

    await expect(page.getByText("Nutrients:")).toBeVisible();
    await expect(page.getByText("Curcumin")).toBeVisible();
  });

  test("should display the Usage section", async ({ page }) => {
    await page.goto("/remedy/103");

    const usageHeading = page.getByRole("heading", { name: "Usage" });
    await expect(usageHeading).toBeVisible();

    await expect(
      page.getByText(/cooking, taken as a supplement/i),
    ).toBeVisible();
  });

  test("should display the Dosage section", async ({ page }) => {
    await page.goto("/remedy/103");

    const dosageHeading = page.getByRole("heading", { name: "Dosage" });
    await expect(dosageHeading).toBeVisible();

    await expect(
      page.getByText(/500-2,000 mg of turmeric extract/i),
    ).toBeVisible();
  });

  test("should display the Precautions section", async ({ page }) => {
    await page.goto("/remedy/103");

    const precautionsHeading = page.getByRole("heading", {
      name: "Precautions",
    });
    await expect(precautionsHeading).toBeVisible();

    await expect(page.getByText(/interact with blood thinners/i)).toBeVisible();
  });

  test("should display the Scientific Information section", async ({
    page,
  }) => {
    await page.goto("/remedy/103");

    const sciHeading = page.getByRole("heading", {
      name: "Scientific Information",
    });
    await expect(sciHeading).toBeVisible();

    // Should show scientific text
    await expect(page.getByText(/COX-2 and 5-LOX enzymes/i)).toBeVisible();

    // Should show references heading
    await expect(page.getByText("References")).toBeVisible();

    // Should show reference link
    const referenceLink = page.getByRole("link", {
      name: /Curcumin: A Review/i,
    });
    await expect(referenceLink).toBeVisible();
    await expect(referenceLink).toHaveAttribute("target", "_blank");
  });

  test("should display Related Remedies sidebar", async ({ page }) => {
    await page.goto("/remedy/103");

    const relatedHeading = page.getByRole("heading", {
      name: "Related Remedies",
    });
    await expect(relatedHeading).toBeVisible();

    // Should show related remedy links (Ginger and Willow Bark for Turmeric)
    const gingerLink = page.getByRole("link", { name: "Ginger" });
    const willowBarkLink = page.getByRole("link", { name: "Willow Bark" });

    await expect(gingerLink).toBeVisible();
    await expect(willowBarkLink).toBeVisible();
  });

  test("should navigate to related remedy when clicked", async ({ page }) => {
    await page.goto("/remedy/103");

    const gingerLink = page.getByRole("link", { name: "Ginger" });
    await gingerLink.click();

    // Should navigate to ginger's page
    await page.waitForURL("**/remedy/104", { timeout: 5000 });
    expect(page.url()).toContain("/remedy/104");

    // Ginger page should load
    await expect(
      page.getByRole("heading", { level: 1, name: "Ginger" }),
    ).toBeVisible();
  });

  test("should have a back navigation button", async ({ page }) => {
    await page.goto("/remedy/103");

    // BackButton component should be rendered
    const backButton = page
      .getByRole("button", { name: /back/i })
      .or(page.getByRole("link", { name: /back/i }));

    await expect(backButton).toBeVisible();
  });

  test("should display medical disclaimer", async ({ page }) => {
    await page.goto("/remedy/103");

    await expect(page.getByText(/Medical Disclaimer/i)).toBeVisible();
    await expect(
      page.getByText(/not intended as a substitute for medical advice/i),
    ).toBeVisible();
  });

  test("should return 404 for non-existent remedy", async ({ page }) => {
    const response = await page.goto("/remedy/999999");

    // Should return 404 status or show a not found page
    if (response) {
      const is404 = response.status() === 404;
      const hasNotFoundText = await page
        .getByText(/not found/i)
        .isVisible()
        .catch(() => false);

      expect(is404 || hasNotFoundText).toBeTruthy();
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/remedy/103");

    // Heading should be visible
    await expect(
      page.getByRole("heading", { level: 1, name: "Turmeric" }),
    ).toBeVisible();

    // Content sections should stack vertically on mobile
    // Just verify key sections are visible
    await expect(page.getByRole("heading", { name: "Usage" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dosage" })).toBeVisible();
  });
});
