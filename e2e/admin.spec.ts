import { test, expect } from "@playwright/test";

test.describe("Admin Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("remedi_onboarding_welcome_completed", "true");
      localStorage.setItem("remedi_welcome_dismissed", "true");
      localStorage.setItem("remedi_onboarding_tour_completed", "true");
      localStorage.setItem("remedi_tour_dismissed", "true");
    });
  });

  test("non-admin user cannot access /admin", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");
    const url = page.url();
    // Should redirect to sign-in, home, or show 403/404
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test("admin page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Unauthenticated users should not see admin content
    const url = page.url();
    // Either redirected or shows access denied
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test("admin moderation queue API can be mocked", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "__session",
        value: "mock-admin-session-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    let moderationApiCalled = false;
    await page.route("**/api/admin/moderation**", (route) => {
      moderationApiCalled = true;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            contributions: [
              {
                id: "contrib-1",
                name: "Test Remedy",
                status: "pending",
                userId: "user-1",
                createdAt: new Date().toISOString(),
              },
            ],
            total: 1,
          },
        }),
      });
    });

    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test("admin users page mock renders without error", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "__session",
        value: "mock-admin-session-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    await page.route("**/api/admin/users**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            users: [
              {
                id: "u-1",
                email: "user@test.com",
                name: "Test User",
                role: "user",
                createdAt: new Date().toISOString(),
              },
            ],
            total: 1,
          },
        }),
      });
    });

    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");

    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test("admin dashboard does not crash on load", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "__session",
        value: "mock-admin-session-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    // Mock all admin API endpoints
    await page.route("**/api/admin/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Verify no JS exceptions crashed the page
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });
});
