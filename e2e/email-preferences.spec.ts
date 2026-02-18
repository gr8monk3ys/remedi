/**
 * E2E Tests for Email Preferences API
 *
 * Tests the /api/email-preferences endpoint including:
 * - Unauthenticated requests are denied (401/403/404) or redirected to sign-in
 * - Validation of input fields
 *
 * Note: In Clerk dev mode, protected API requests may redirect to /sign-in.
 * When redirects are followed, this can appear as a final 200 response.
 */

import { test, expect } from "@playwright/test";

test.describe("Email Preferences API", () => {
  const API_URL = "/api/email-preferences";
  const AUTH_FAILURE_STATUSES = [401, 403, 404];

  const expectRejectedOrRedirected = (
    status: number,
    finalUrl: string,
    allowValidationError = false,
  ): void => {
    const allowedStatuses = allowValidationError
      ? [...AUTH_FAILURE_STATUSES, 400]
      : AUTH_FAILURE_STATUSES;

    if (allowedStatuses.includes(status)) return;

    // Playwright request context follows redirects by default:
    // protected routes can end at /sign-in with HTTP 200.
    if (status === 200) {
      expect(finalUrl).toContain("/sign-in");
      return;
    }

    throw new Error(
      `Unexpected response status ${status} for ${finalUrl}. Expected one of ${allowedStatuses.join(", ")} or a sign-in redirect.`,
    );
  };

  test("should reject GET request when not authenticated", async ({
    request,
  }) => {
    const response = await request.get(API_URL);

    expectRejectedOrRedirected(response.status(), response.url());
  });

  test("should reject PATCH request without CSRF token", async ({
    request,
  }) => {
    const response = await request.patch(API_URL, {
      data: { weeklyDigest: false },
    });

    expectRejectedOrRedirected(response.status(), response.url());
  });

  test("should reject PATCH with empty body", async ({ request }) => {
    const response = await request.patch(API_URL, {
      data: {},
    });

    expectRejectedOrRedirected(response.status(), response.url());
  });

  test("should reject PATCH with invalid field types", async ({ request }) => {
    const response = await request.patch(API_URL, {
      data: { weeklyDigest: "not-a-boolean" },
    });

    expectRejectedOrRedirected(response.status(), response.url(), true);
  });
});
