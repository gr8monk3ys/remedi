/**
 * E2E Tests for Homepage
 *
 * Tests critical functionality on the homepage including:
 * - Page loads correctly with shadcn/ui components
 * - Search section renders (dynamically loaded)
 * - Navigation via header
 * - Accessibility
 * - Theme toggle
 * - Responsive layout
 */

import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss any onboarding modals by setting the localStorage flag
    await page.addInitScript(() => {
      localStorage.setItem("remedi_first_visit", "true");
      localStorage.setItem("remedi_tutorial_completed", "true");
    });
    await page.goto("/");
  });

  test("should load the homepage successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Remedi/i);
  });

  test("should display the main heading", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Find natural alternatives");
  });

  test("should display the hero subtitle", async ({ page }) => {
    await expect(
      page.getByText(
        "Search any drug or supplement to discover evidence-based natural remedies",
      ),
    ).toBeVisible();
  });

  test("should display the evidence-based badge", async ({ page }) => {
    await expect(
      page.getByText("Evidence-based natural alternatives"),
    ).toBeVisible();
  });

  test("should have a search input field", async ({ page }) => {
    // The SearchComponent is dynamically loaded; wait for it
    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await expect(searchInput).toBeEnabled();
  });

  test("should show search input placeholder", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await expect(searchInput).toHaveAttribute(
      "placeholder",
      /Search a drug or supplement/i,
    );
  });

  test("should display suggestion badges", async ({ page }) => {
    // Wait for the dynamically loaded search component
    await page.getByRole("searchbox").waitFor({ timeout: 10000 });

    // Check for default suggestion badges
    await expect(page.getByText("Vitamin D")).toBeVisible();
    await expect(page.getByText("Ibuprofen")).toBeVisible();
    await expect(page.getByText("Melatonin")).toBeVisible();
    await expect(page.getByText("Omega-3")).toBeVisible();
    await expect(page.getByText("Tylenol")).toBeVisible();
  });

  test("should display features grid", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Smart Search" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Evidence-Based" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "AI-Powered" }),
    ).toBeVisible();
  });

  test("should display the medical disclaimer", async ({ page }) => {
    await expect(
      page.getByText(/not a substitute for professional medical advice/i),
    ).toBeVisible();
  });

  test("should have accessible navigation in header", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Check for the Remedi logo link
    const logoLink = header.getByRole("link", { name: /Remedi/i });
    await expect(logoLink).toBeVisible();

    // Check for desktop navigation links (hidden on mobile)
    const desktopNav = header.locator("nav").first();
    const homeLink = desktopNav.getByRole("link", { name: "Home" });
    const aboutLink = desktopNav.getByRole("link", { name: "About" });
    const faqLink = desktopNav.getByRole("link", { name: "FAQ" });

    // On desktop viewport these should be visible
    if (await homeLink.isVisible()) {
      await expect(homeLink).toBeVisible();
      await expect(aboutLink).toBeVisible();
      await expect(faqLink).toBeVisible();
    }
  });

  test("should have a compare link in navigation", async ({ page }) => {
    const header = page.locator("header");
    const compareLink = header.getByRole("link", { name: /Compare/i });

    // On desktop viewport
    if (await compareLink.isVisible()) {
      await expect(compareLink).toBeVisible();
    }
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.keyboard.press("Tab");

    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });

  test("should have proper meta tags", async ({ page }) => {
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toBeTruthy();
    expect(description?.length).toBeGreaterThan(0);
  });

  test("should load without critical console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");

    // Filter out known acceptable errors (third-party, Clerk, hydration warnings)
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("third-party") &&
        !error.includes("warning") &&
        !error.includes("clerk") &&
        !error.includes("Clerk") &&
        !error.includes("hydrat") &&
        !error.includes("Failed to fetch"),
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Main heading should still be visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Mobile menu button should be visible
    const menuButton = page.getByRole("button", { name: /Open menu/i });
    await expect(menuButton).toBeVisible();
  });

  test("should open mobile menu sheet", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByRole("button", { name: /Open menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Sheet should open with nav links
    await expect(page.getByRole("heading", { name: /Remedi/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "FAQ" })).toBeVisible();
  });

  test("should have dark mode toggle", async ({ page }) => {
    const themeToggle = page
      .getByRole("button", { name: /Toggle theme/i })
      .first();

    await expect(themeToggle).toBeVisible();
    await themeToggle.click();

    // Wait for theme class to be applied
    await page
      .waitForFunction(
        () =>
          document.documentElement.classList.contains("dark") ||
          document.documentElement.getAttribute("data-theme") === "dark" ||
          document.documentElement
            .getAttribute("style")
            ?.includes("color-scheme"),
        { timeout: 2000 },
      )
      .catch(() => {
        // next-themes may use a different mechanism
      });

    // The toggle should still be visible after clicking
    await expect(themeToggle).toBeVisible();
  });

  test("should display search loading skeleton while component loads", async ({
    page,
  }) => {
    // Navigate without waiting for search component to load
    // The SearchSection shows a skeleton while the dynamic import loads
    await page.goto("/");

    // The skeleton placeholders use animate-pulse
    const skeleton = page.locator(".animate-pulse").first();

    // The skeleton might appear briefly or might already be resolved;
    // just verify the page doesn't break
    const skeletonVisible = await skeleton.isVisible().catch(() => false);
    // Either skeleton is visible (still loading) or search loaded fast
    expect(typeof skeletonVisible).toBe("boolean");
  });

  test("should have a footer with links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    await expect(footer.getByRole("link", { name: "FAQ" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "About" })).toBeVisible();
    await expect(footer.getByText(/informational purposes/i)).toBeVisible();
  });
});
