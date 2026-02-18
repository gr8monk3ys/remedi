import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type MockAuthObject = {
  protect: () => Promise<void>;
  userId: string | null;
  sessionId: string | null;
  getToken: () => Promise<string | null>;
};

type MockClerkMiddlewareHandler = (
  auth: MockAuthObject,
  req: NextRequest,
) => Promise<Response | NextResponse | void> | Response | NextResponse | void;

type MockClerkClient = {
  users: {
    updateUserMetadata: (
      userId: string,
      payload: Record<string, unknown>,
    ) => Promise<{ userId: string; payload: Record<string, unknown> }>;
  };
};

const E2E_AUTH_COOKIE_NAMES = ["e2e_auth", "__session"] as const;

function isE2EAuthenticated(req: NextRequest): boolean {
  return E2E_AUTH_COOKIE_NAMES.some((name) =>
    Boolean(req.cookies.get(name)?.value),
  );
}

function compileRouteMatcher(pattern: string): RegExp {
  if (pattern.endsWith("(.*)")) {
    const prefix = pattern.slice(0, -4).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${prefix}.*$`);
  }

  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}$`);
}

export function createRouteMatcher(
  patterns: string[],
): (req: NextRequest) => boolean {
  const matchers = patterns.map(compileRouteMatcher);
  return (req: NextRequest) =>
    matchers.some((matcher) => matcher.test(req.nextUrl.pathname));
}

export function clerkMiddleware(handler: MockClerkMiddlewareHandler) {
  return async (req: NextRequest): Promise<Response | NextResponse> => {
    const isAuthenticated = isE2EAuthenticated(req);
    const authObj: MockAuthObject = {
      protect: async () => {
        if (!isAuthenticated) {
          throw new Error("Unauthorized");
        }
      },
      userId: isAuthenticated ? "e2e-local-user" : null,
      sessionId: isAuthenticated ? "e2e-local-session" : null,
      getToken: async () => null,
    };

    const response = await handler(authObj, req);
    return response ?? NextResponse.next();
  };
}

export async function auth(): Promise<{
  userId: string | null;
  sessionId: string | null;
  orgId: string | null;
  getToken: () => Promise<string | null>;
}> {
  return {
    userId: null,
    sessionId: null,
    orgId: null,
    getToken: async () => null,
  };
}

export async function currentUser(): Promise<null> {
  return null;
}

export async function clerkClient(): Promise<MockClerkClient> {
  return {
    users: {
      updateUserMetadata: async (
        userId: string,
        payload: Record<string, unknown>,
      ) => ({ userId, payload }),
    },
  };
}

export type WebhookEvent = {
  type: string;
  data: Record<string, unknown>;
};
