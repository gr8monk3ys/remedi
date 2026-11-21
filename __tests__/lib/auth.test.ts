/**
 * lib/auth.ts reads the Better Auth session and keeps the shape and role
 * guards its callers rely on.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/lib/better-auth";
import {
  authErrorResponse,
  getCurrentUser,
  isAdmin,
  isModerator,
  requireRole,
  requireUser,
} from "@/lib/auth";

const getSession = vi.mocked(auth.api.getSession);

const now = new Date();

function signInAs(role: string | undefined) {
  getSession.mockResolvedValue({
    session: {
      id: "s1",
      token: "t",
      userId: "u1",
      expiresAt: now,
      createdAt: now,
      updatedAt: now,
    },
    user: {
      id: "u1",
      name: "Ada",
      email: "ada@example.com",
      image: null,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      role,
    },
  });
}

beforeEach(() => {
  getSession.mockReset();
  getSession.mockResolvedValue(null);
});

describe("getCurrentUser", () => {
  it("is null without a session", async () => {
    expect(await getCurrentUser()).toBeNull();
  });

  it("maps the session user to the app's user shape", async () => {
    signInAs("moderator");
    expect(await getCurrentUser()).toEqual({
      id: "u1",
      name: "Ada",
      email: "ada@example.com",
      image: null,
      role: "moderator",
    });
  });

  it("treats a missing role as the default user role", async () => {
    signInAs(undefined);
    expect((await getCurrentUser())?.role).toBe("user");
  });
});

describe("role guards", () => {
  it("separates admin from moderator", async () => {
    signInAs("moderator");
    expect(await isAdmin()).toBe(false);
    expect(await isModerator()).toBe(true);
  });

  it("requireUser throws 401 when signed out", async () => {
    const error = await requireUser().catch((e: unknown) => e);
    expect(authErrorResponse(error)?.status).toBe(401);
  });

  it("requireRole throws 403 for the wrong role", async () => {
    signInAs("user");
    const error = await requireRole("admin").catch((e: unknown) => e);
    expect(authErrorResponse(error)?.status).toBe(403);
  });

  it("requireRole returns the user for an allowed role", async () => {
    signInAs("admin");
    expect((await requireRole(["admin"])).id).toBe("u1");
  });
});
