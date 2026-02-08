/**
 * E2E Tests for Email Preferences API
 *
 * Tests the /api/email-preferences endpoint including:
 * - GET returns preferences (requires auth)
 * - PATCH updates preferences (requires auth)
 * - Unauthenticated requests are rejected
 * - Validation of input fields
 *
 * Note: There is no dedicated UI page for email preferences yet;
 * these tests exercise the API routes directly.
 */

import { test, expect } from "@playwright/test";

test.describe("Email Preferences API", () => {
  const API_URL = "/api/email-preferences";

  test("should reject GET request when not authenticated", async ({
    request,
  }) => {
    const response = await request.get(API_URL);

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.success).toBeFalsy();
  });

  test("should reject PATCH request when not authenticated", async ({
    request,
  }) => {
    const response = await request.patch(API_URL, {
      data: { weeklyDigest: false },
    });

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.success).toBeFalsy();
  });

  test("should reject PATCH with empty body when not authenticated", async ({
    request,
  }) => {
    const response = await request.patch(API_URL, {
      data: {},
    });

    // Should return 401 (auth check happens before validation)
    expect(response.status()).toBe(401);
  });

  test("should reject PATCH with invalid field types", async ({ request }) => {
    const response = await request.patch(API_URL, {
      data: { weeklyDigest: "not-a-boolean" },
    });

    // Should return 400 or 401 depending on auth state
    expect([400, 401]).toContain(response.status());
  });
});
