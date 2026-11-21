/**
 * E2E Tests for Authentication (Better Auth, email + password)
 *
 * - Sign-in and sign-up forms render and are accessible
 * - Signed-out visitors see a Sign In link and are redirected from protected pages
 * - The E2E user (auth.setup.ts) can sign in through the form and sign out
 * - Sign-up asks the new user to verify their email before signing in
 */

import { test, expect } from "@playwright/test";
import { E2E_USER } from "./session";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss onboarding modals using correct storage keys
    await page.addInitScript(() => {
      localStorage.setItem("remedi_onboarding_welcome_completed", "true");
      localStorage.setItem("remedi_welcome_dismissed", "true");
      localStorage.setItem("remedi_onboarding_tour_completed", "true");
      localStorage.setItem("remedi_tour_dismissed", "true");
    });
  });

  test("should display the sign in form", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(
      page.getByRole("heading", { name: /sign in to remedi/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /forgot your password/i }),
    ).toBeVisible();
  });

  test("should show Sign In link when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(
      page
        .locator("header")
        .getByRole("link", { name: /Sign In/i })
        .first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should redirect to sign in for protected routes", async ({ page }) => {
    await page.goto("/user-profile");

    await expect(page).toHaveURL(/\/sign-in\?redirect_url=%2Fuser-profile/);
  });

  test("should reject a wrong password", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(E2E_USER.email);
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("should sign in through the form and return to the requested page", async ({
    page,
  }) => {
    await page.goto("/sign-in?redirect_url=/user-profile");
    await page.getByLabel("Email").fill(E2E_USER.email);
    await page.getByLabel("Password").fill(E2E_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // The first visit compiles /user-profile in the dev server.
    await expect(
      page.getByRole("heading", { name: "Your Profile" }),
    ).toBeVisible({ timeout: 30000 });
    await expect(page).toHaveURL(/\/user-profile$/);
    await expect(page.getByText(E2E_USER.email).first()).toBeVisible();
  });

  test("should show the user button when authenticated and sign out", async ({
    page,
    baseURL,
  }) => {
    // A session of its own: signing out revokes it server-side, and the shared
    // one from auth.setup.ts is in use by tests running in parallel.
    const response = await page.request.post("/api/auth/sign-in/email", {
      data: { email: E2E_USER.email, password: E2E_USER.password },
      headers: { Origin: baseURL! },
    });
    expect(response.ok()).toBeTruthy();
    await page.goto("/");

    const header = page.locator("header");
    await expect(
      header.getByRole("link", { name: "Your profile" }).first(),
    ).toBeVisible({ timeout: 30000 });

    await header.getByRole("button", { name: "Sign Out" }).first().click();

    // Generous: the dev server may compile on the sign-out request and reload.
    await expect(
      header.getByRole("link", { name: /Sign In/i }).first(),
    ).toBeVisible({ timeout: 30000 });
  });

  test("should ask a new user to verify their email", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Name").fill("New E2E User");
    await page
      .getByLabel("Email")
      .fill(`e2e-signup-${Date.now()}@remedi.local`);
    await page.getByLabel("Password").fill("a-long-enough-password");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByRole("status")).toContainText(/verify your email/i);
  });

  test("should have accessible sign in form", async ({ page }) => {
    await page.goto("/sign-in");
    await page.keyboard.press("Tab");

    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(focusedElement).toBeTruthy();
  });
});
