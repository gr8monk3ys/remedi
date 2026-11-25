import { readFileSync } from "node:fs";
import type { BrowserContext } from "@playwright/test";

export const E2E_AUTH_FILE = "e2e/.auth/user.json";

export const E2E_USER = {
  name: "E2E User",
  email: "e2e-user@remedi.local",
  password: "e2e-user-password",
};

/** Give this context the E2E user's real session (created by auth.setup.ts). */
export async function signIn(context: BrowserContext): Promise<void> {
  const { cookies } = JSON.parse(readFileSync(E2E_AUTH_FILE, "utf8")) as {
    cookies: Parameters<BrowserContext["addCookies"]>[0];
  };
  await context.addCookies(cookies);
}
