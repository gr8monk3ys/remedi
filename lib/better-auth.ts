/**
 * Better Auth server instance.
 *
 * Email + password with required email verification and password reset.
 * Mounted at /api/auth/* by app/api/auth/[...all]/route.ts. Application code
 * reads the session through lib/auth.ts, not from here.
 *
 * Emails go through lib/email (Resend). The sends are not awaited, as Better
 * Auth recommends: awaiting them makes response time reveal whether an
 * address has an account.
 *
 * @see https://www.better-auth.com/docs
 */

import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
import {
  isEmailConfigured,
  sendEmailVerification,
  sendPasswordReset,
} from "@/lib/email";
import { createLogger } from "@/lib/logger";
import { eraseUserData, onUserCreated } from "@/lib/account-lifecycle";

const logger = createLogger("auth");

const VERIFY_EXPIRES_IN_SECONDS = 60 * 60 * 24;
const RESET_EXPIRES_IN_SECONDS = 60 * 60;

/**
 * Without Resend configured, lib/email skips the send. Outside production the
 * link is logged instead so sign-up and reset can be completed locally.
 */
function logLinkWhenEmailIsOff(kind: string, email: string, url: string) {
  if (!isEmailConfigured() && process.env.NODE_ENV !== "production") {
    logger.info(`Email disabled; ${kind} link for ${email}: ${url}`);
  }
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  advanced: {
    database: { generateId: "uuid" },
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false, required: false },
    },
    changeEmail: { enabled: true },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => eraseUserData(user.id),
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: RESET_EXPIRES_IN_SECONDS,
    sendResetPassword: async ({ user, url }) => {
      logLinkWhenEmailIsOff("password reset", user.email, url);
      void sendPasswordReset(
        user.email,
        { name: user.name || "there", resetUrl: url, expiresIn: "1 hour" },
        user.id,
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: VERIFY_EXPIRES_IN_SECONDS,
    sendVerificationEmail: async ({ user, url }) => {
      logLinkWhenEmailIsOff("verification", user.email, url);
      void sendEmailVerification(
        user.email,
        { name: user.name || "there", verifyUrl: url, expiresIn: "24 hours" },
        user.id,
      );
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => onUserCreated(user),
      },
    },
  },
  // Must stay last: it applies Set-Cookie from auth calls made in server actions.
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
