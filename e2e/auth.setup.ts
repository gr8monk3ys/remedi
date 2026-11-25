/**
 * Creates the E2E user through the real Better Auth API and saves its signed-in
 * session to E2E_AUTH_FILE for specs that need one (see ./session.ts).
 *
 * Email verification is required to sign in, and the dev server only logs the
 * verification link, so the user's address is marked verified in the database
 * directly.
 */

import { test as setup, expect } from "@playwright/test";
import { Pool } from "pg";
import { E2E_AUTH_FILE, E2E_USER } from "./session";

setup("create and sign in the E2E user", async ({ request, baseURL }) => {
  const origin = { Origin: baseURL! };

  const signUp = await request.post("/api/auth/sign-up/email", {
    data: E2E_USER,
    headers: origin,
  });
  // A repeat run finds the user already there; Better Auth answers that
  // without revealing it, so only a server error is a failure.
  expect(signUp.status()).toBeLessThan(500);

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://remedi:remedi_dev@localhost:5433/remedi?schema=public",
  });
  const verified = await pool.query(
    'UPDATE "User" SET "emailVerified" = true WHERE email = $1',
    [E2E_USER.email],
  );
  await pool.end();
  expect(verified.rowCount).toBe(1);

  const signIn = await request.post("/api/auth/sign-in/email", {
    data: { email: E2E_USER.email, password: E2E_USER.password },
    headers: origin,
  });
  expect(signIn.ok()).toBeTruthy();

  await request.storageState({ path: E2E_AUTH_FILE });
});
