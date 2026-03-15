/**
 * Tests for /api/webhooks/clerk route
 *
 * Tests Clerk webhook event handling:
 * - Missing CLERK_WEBHOOK_SECRET environment variable
 * - Missing svix headers
 * - Webhook signature verification failure
 * - user.created event (new user + existing user migration)
 * - user.updated event (existing user + user not found)
 * - user.deleted event
 * - Unknown event types (graceful no-op)
 * - Database errors (graceful handling)
 * - Correct field extraction from Clerk event payload
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock next/headers
const mockHeadersGet = vi.fn();
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: (name: string) => mockHeadersGet(name),
  }),
}));

// Mock svix Webhook class
const mockVerify = vi.fn();
vi.mock("svix", () => {
  return {
    Webhook: class MockWebhook {
      constructor(_secret: string) {
        // no-op
      }
      verify(body: string, headers: Record<string, string>) {
        return mockVerify(body, headers);
      }
    },
  };
});

// Mock Prisma
const mockUserFindUnique = vi.fn();
const mockUserCreate = vi.fn();
const mockUserUpdate = vi.fn();
const mockUserDeleteMany = vi.fn();
const mockEmailPreferenceUpsert = vi.fn();
const mockTransaction = vi.fn();
const mockFavoriteDeleteMany = vi.fn();
const mockSearchHistoryDeleteMany = vi.fn();
const mockFilterPreferenceDeleteMany = vi.fn();
const mockUserEventDeleteMany = vi.fn();
const mockConversionEventDeleteMany = vi.fn();
const mockEmailLogDeleteMany = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: (...args: unknown[]) => mockTransaction(...args),
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
      deleteMany: (...args: unknown[]) => mockUserDeleteMany(...args),
    },
    emailPreference: {
      upsert: (...args: unknown[]) => mockEmailPreferenceUpsert(...args),
    },
    favorite: {
      deleteMany: (...args: unknown[]) => mockFavoriteDeleteMany(...args),
    },
    searchHistory: {
      deleteMany: (...args: unknown[]) => mockSearchHistoryDeleteMany(...args),
    },
    filterPreference: {
      deleteMany: (...args: unknown[]) =>
        mockFilterPreferenceDeleteMany(...args),
    },
    userEvent: {
      deleteMany: (...args: unknown[]) => mockUserEventDeleteMany(...args),
    },
    conversionEvent: {
      deleteMany: (...args: unknown[]) =>
        mockConversionEventDeleteMany(...args),
    },
    emailLog: {
      deleteMany: (...args: unknown[]) => mockEmailLogDeleteMany(...args),
    },
  },
}));

// Mock clerkClient (override the global mock from setup.ts)
const mockUpdateUserMetadata = vi.fn();
vi.mock("@clerk/nextjs/server", async () => {
  return {
    auth: vi.fn().mockResolvedValue({ userId: null }),
    currentUser: vi.fn().mockResolvedValue(null),
    clerkMiddleware: vi.fn(
      (handler: (...args: unknown[]) => unknown) => handler,
    ),
    createRouteMatcher: vi.fn(() => () => false),
    clerkClient: vi.fn().mockResolvedValue({
      users: { updateUserMetadata: mockUpdateUserMetadata },
    }),
  };
});

// Mock email service
const mockSendWelcomeEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: (...args: unknown[]) => mockSendWelcomeEmail(...args),
}));

// ============================================================================
// Test Data
// ============================================================================

const SVIX_HEADERS: Record<string, string> = {
  "svix-id": "msg_test_123",
  "svix-timestamp": "1234567890",
  "svix-signature": "v1,test_signature",
};

function createClerkUserPayload(overrides = {}) {
  return {
    id: "user_test123",
    email_addresses: [{ email_address: "test@example.com", id: "email_1" }],
    primary_email_address_id: "email_1",
    first_name: "Test",
    last_name: "User",
    image_url: "https://example.com/avatar.png",
    ...overrides,
  };
}

const mockDbUser = {
  id: "db-user-1",
  clerkId: "user_test123",
  email: "test@example.com",
  name: "Test User",
  image: "https://example.com/avatar.png",
  role: "user",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// ============================================================================
// Test Setup
// ============================================================================

beforeEach(() => {
  vi.stubEnv("CLERK_WEBHOOK_SECRET", "whsec_test_secret");

  // Default: return all svix headers
  mockHeadersGet.mockImplementation((name: string) => {
    return SVIX_HEADERS[name] || null;
  });

  // Default: email preference upsert succeeds
  mockEmailPreferenceUpsert.mockResolvedValue({});

  // Default: welcome email succeeds
  mockSendWelcomeEmail.mockResolvedValue({ success: true });

  // Default: transaction awaits all operations (so rejections propagate)
  mockTransaction.mockImplementation(async (ops: unknown) => {
    if (Array.isArray(ops)) {
      return Promise.all(ops);
    }
    return [];
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

// ============================================================================
// Tests
// ============================================================================

describe("/api/webhooks/clerk", () => {
  describe("POST /api/webhooks/clerk", () => {
    // ------------------------------------------------------------------
    // Environment & Configuration
    // ------------------------------------------------------------------

    it("should return 500 when CLERK_WEBHOOK_SECRET is missing", async () => {
      vi.stubEnv("CLERK_WEBHOOK_SECRET", "");

      const { POST } = await import("@/app/api/webhooks/clerk/route");

      const request = new Request("http://localhost:3000/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const text = await response.text();

      expect(response.status).toBe(500);
      expect(text).toContain("Server configuration error");
    });

    // ------------------------------------------------------------------
    // Header Validation
    // ------------------------------------------------------------------

    it("should return 400 when svix-id header is missing", async () => {
      mockHeadersGet.mockImplementation((name: string) => {
        if (name === "svix-id") return null;
        return SVIX_HEADERS[name] || null;
      });

      const { POST } = await import("@/app/api/webhooks/clerk/route");

      const request = new Request("http://localhost:3000/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const text = await response.text();

      expect(response.status).toBe(400);
      expect(text).toContain("Missing svix headers");
    });

    it("should return 400 when svix-timestamp header is missing", async () => {
      mockHeadersGet.mockImplementation((name: string) => {
        if (name === "svix-timestamp") return null;
        return SVIX_HEADERS[name] || null;
      });

      const { POST } = await import("@/app/api/webhooks/clerk/route");

      const request = new Request("http://localhost:3000/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const text = await response.text();

      expect(response.status).toBe(400);
      expect(text).toContain("Missing svix headers");
    });

    it("should return 400 when svix-signature header is missing", async () => {
      mockHeadersGet.mockImplementation((name: string) => {
        if (name === "svix-signature") return null;
        return SVIX_HEADERS[name] || null;
      });

      const { POST } = await import("@/app/api/webhooks/clerk/route");

      const request = new Request("http://localhost:3000/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const text = await response.text();

      expect(response.status).toBe(400);
      expect(text).toContain("Missing svix headers");
    });

    it("should return 400 when all svix headers are missing", async () => {
      mockHeadersGet.mockReturnValue(null);

      const { POST } = await import("@/app/api/webhooks/clerk/route");

      const request = new Request("http://localhost:3000/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const text = await response.text();

      expect(response.status).toBe(400);
      expect(text).toContain("Missing svix headers");
    });

    // ------------------------------------------------------------------
    // Webhook Verification
    // ------------------------------------------------------------------

    it("should return 400 when webhook verification fails", async () => {
      mockVerify.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const { POST } = await import("@/app/api/webhooks/clerk/route");

      const request = new Request("http://localhost:3000/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify({ type: "user.created", data: {} }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const text = await response.text();

      expect(response.status).toBe(400);
      expect(text).toContain("Webhook verification failed");
    });

    it("should pass correct headers to svix verify", async () => {
      const userData = createClerkUserPayload();
      mockVerify.mockReturnValue({
        type: "user.created",
        data: userData,
      });
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue(mockDbUser);

      const { POST } = await import("@/app/api/webhooks/clerk/route");

      const payload = { type: "user.created", data: userData };
      const request = new Request("http://localhost:3000/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      await POST(request);

      expect(mockVerify).toHaveBeenCalledWith(JSON.stringify(payload), {
        "svix-id": SVIX_HEADERS["svix-id"],
        "svix-timestamp": SVIX_HEADERS["svix-timestamp"],
        "svix-signature": SVIX_HEADERS["svix-signature"],
      });
    });

    // ------------------------------------------------------------------
    // user.created Event
    // ------------------------------------------------------------------

    describe("user.created", () => {
      it("should create a new user in the database", async () => {
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockResolvedValue(mockDbUser);

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUserCreate).toHaveBeenCalledWith({
          data: {
            clerkId: "user_test123",
            email: "test@example.com",
            name: "Test User",
            image: "https://example.com/avatar.png",
            role: "user",
          },
        });
      });

      it("should extract correct fields from Clerk payload", async () => {
        const userData = createClerkUserPayload({
          id: "user_abc789",
          email_addresses: [
            { email_address: "hello@world.com", id: "email_99" },
          ],
          first_name: "Jane",
          last_name: "Doe",
          image_url: "https://cdn.example.com/jane.jpg",
        });

        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockResolvedValue({
          ...mockDbUser,
          id: "db-user-2",
          clerkId: "user_abc789",
          email: "hello@world.com",
          name: "Jane Doe",
          image: "https://cdn.example.com/jane.jpg",
        });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await POST(request);

        expect(mockUserCreate).toHaveBeenCalledWith({
          data: {
            clerkId: "user_abc789",
            email: "hello@world.com",
            name: "Jane Doe",
            image: "https://cdn.example.com/jane.jpg",
            role: "user",
          },
        });
      });

      it("should handle user with only first_name (no last_name)", async () => {
        const userData = createClerkUserPayload({
          first_name: "Alice",
          last_name: null,
        });
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockResolvedValue({
          ...mockDbUser,
          name: "Alice",
        });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await POST(request);

        expect(mockUserCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              name: "Alice",
            }),
          }),
        );
      });

      it("should set name to null when both first_name and last_name are absent", async () => {
        const userData = createClerkUserPayload({
          first_name: null,
          last_name: null,
        });
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockResolvedValue({
          ...mockDbUser,
          name: null,
        });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await POST(request);

        expect(mockUserCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              name: null,
            }),
          }),
        );
      });

      it("should return 400 when no email address is found", async () => {
        const userData = createClerkUserPayload({
          email_addresses: [],
        });
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);
        const text = await response.text();

        expect(response.status).toBe(400);
        expect(text).toContain("No email address found");
        expect(mockUserCreate).not.toHaveBeenCalled();
      });

      it("should link existing user when email already exists (migration from NextAuth)", async () => {
        const existingUser = {
          ...mockDbUser,
          clerkId: null,
          name: "Old Name",
          image: "https://example.com/old.png",
        };
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(existingUser);
        mockUserUpdate.mockResolvedValue(mockDbUser);

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUserUpdate).toHaveBeenCalledWith({
          where: { email: "test@example.com" },
          data: {
            clerkId: "user_test123",
            name: "Test User",
            image: "https://example.com/avatar.png",
          },
        });
        expect(mockUserCreate).not.toHaveBeenCalled();
      });

      it("should preserve existing name when Clerk name is absent during migration", async () => {
        const existingUser = {
          ...mockDbUser,
          clerkId: null,
          name: "Existing Name",
          image: "https://example.com/old.png",
        };
        const userData = createClerkUserPayload({
          first_name: null,
          last_name: null,
          image_url: null,
        });
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(existingUser);
        mockUserUpdate.mockResolvedValue({
          ...existingUser,
          clerkId: "user_test123",
        });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await POST(request);

        expect(mockUserUpdate).toHaveBeenCalledWith({
          where: { email: "test@example.com" },
          data: expect.objectContaining({
            clerkId: "user_test123",
            name: "Existing Name",
            image: "https://example.com/old.png",
          }),
        });
      });

      it("should sync role and dbUserId to Clerk publicMetadata", async () => {
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockResolvedValue(mockDbUser);

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await POST(request);

        expect(mockUpdateUserMetadata).toHaveBeenCalledWith("user_test123", {
          publicMetadata: {
            role: "user",
            dbUserId: "db-user-1",
          },
        });
      });

      it("should create default email preferences for new user", async () => {
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockResolvedValue(mockDbUser);

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await POST(request);

        expect(mockEmailPreferenceUpsert).toHaveBeenCalledWith({
          where: { userId: "db-user-1" },
          update: {},
          create: {
            userId: "db-user-1",
            weeklyDigest: true,
            marketingEmails: false,
            productUpdates: true,
            subscriptionReminders: true,
          },
        });
      });

      it("should send welcome email on user.created", async () => {
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockResolvedValue(mockDbUser);

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await POST(request);

        expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
          "test@example.com",
          "Test User",
          "db-user-1",
        );
      });

      it('should send welcome email with "there" when name is null', async () => {
        const userData = createClerkUserPayload({
          first_name: null,
          last_name: null,
        });
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockResolvedValue({ ...mockDbUser, name: null });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await POST(request);

        expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
          "test@example.com",
          "there",
          "db-user-1",
        );
      });

      it("should not fail when email preference creation fails", async () => {
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockResolvedValue(mockDbUser);
        mockEmailPreferenceUpsert.mockRejectedValue(
          new Error("Email pref DB error"),
        );

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);

        // Should still succeed - email preferences are non-critical
        expect(response.status).toBe(200);
      });

      it("should not fail when welcome email sending fails", async () => {
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockResolvedValue(mockDbUser);
        mockSendWelcomeEmail.mockRejectedValue(new Error("Email send error"));

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);

        // Should still succeed - email sending is non-critical
        expect(response.status).toBe(200);
      });
    });

    // ------------------------------------------------------------------
    // user.updated Event
    // ------------------------------------------------------------------

    describe("user.updated", () => {
      it("should update existing user in the database", async () => {
        const userData = createClerkUserPayload({
          first_name: "Updated",
          last_name: "Name",
          image_url: "https://example.com/new-avatar.png",
        });
        mockVerify.mockReturnValue({
          type: "user.updated",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(mockDbUser);
        const updatedUser = {
          ...mockDbUser,
          name: "Updated Name",
          image: "https://example.com/new-avatar.png",
        };
        mockUserUpdate.mockResolvedValue(updatedUser);

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.updated", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUserUpdate).toHaveBeenCalledWith({
          where: { clerkId: "user_test123" },
          data: {
            name: "Updated Name",
            image: "https://example.com/new-avatar.png",
            email: "test@example.com",
          },
        });
      });

      it("should sync publicMetadata after update", async () => {
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.updated",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(mockDbUser);
        mockUserUpdate.mockResolvedValue(mockDbUser);

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.updated", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await POST(request);

        expect(mockUpdateUserMetadata).toHaveBeenCalledWith("user_test123", {
          publicMetadata: {
            role: mockDbUser.role,
            dbUserId: mockDbUser.id,
          },
        });
      });

      it("should not update when user not found in database", async () => {
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.updated",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.updated", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUserUpdate).not.toHaveBeenCalled();
        expect(mockUpdateUserMetadata).not.toHaveBeenCalled();
      });

      it("should find user by clerkId for update", async () => {
        const userData = createClerkUserPayload({ id: "user_xyz456" });
        mockVerify.mockReturnValue({
          type: "user.updated",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.updated", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await POST(request);

        expect(mockUserFindUnique).toHaveBeenCalledWith({
          where: { clerkId: "user_xyz456" },
        });
      });
    });

    // ------------------------------------------------------------------
    // user.deleted Event
    // ------------------------------------------------------------------

    describe("user.deleted", () => {
      it("should delete user from database", async () => {
        mockVerify.mockReturnValue({
          type: "user.deleted",
          data: { id: "user_test123" },
        });
        mockUserFindUnique.mockResolvedValue({ id: "db-user-1" });
        mockFavoriteDeleteMany.mockResolvedValue({ count: 0 });
        mockSearchHistoryDeleteMany.mockResolvedValue({ count: 0 });
        mockFilterPreferenceDeleteMany.mockResolvedValue({ count: 0 });
        mockUserEventDeleteMany.mockResolvedValue({ count: 0 });
        mockConversionEventDeleteMany.mockResolvedValue({ count: 0 });
        mockEmailLogDeleteMany.mockResolvedValue({ count: 0 });
        mockUserDeleteMany.mockResolvedValue({ count: 1 });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({
              type: "user.deleted",
              data: { id: "user_test123" },
            }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUserFindUnique).toHaveBeenCalledWith({
          where: { clerkId: "user_test123" },
          select: { id: true },
        });
        expect(mockFavoriteDeleteMany).toHaveBeenCalledWith({
          where: { userId: "db-user-1" },
        });
        expect(mockSearchHistoryDeleteMany).toHaveBeenCalledWith({
          where: { userId: "db-user-1" },
        });
        expect(mockFilterPreferenceDeleteMany).toHaveBeenCalledWith({
          where: { userId: "db-user-1" },
        });
        expect(mockUserEventDeleteMany).toHaveBeenCalledWith({
          where: { userId: "db-user-1" },
        });
        expect(mockConversionEventDeleteMany).toHaveBeenCalledWith({
          where: { userId: "db-user-1" },
        });
        expect(mockEmailLogDeleteMany).toHaveBeenCalledWith({
          where: { userId: "db-user-1" },
        });
        expect(mockUserDeleteMany).toHaveBeenCalledWith({
          where: { clerkId: "user_test123" },
        });
        expect(mockTransaction).toHaveBeenCalledTimes(1);
      });

      it("should not call deleteMany when id is missing", async () => {
        mockVerify.mockReturnValue({
          type: "user.deleted",
          data: { id: undefined },
        });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({
              type: "user.deleted",
              data: {},
            }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUserDeleteMany).not.toHaveBeenCalled();
      });

      it("should handle deleting a user that does not exist in database", async () => {
        mockVerify.mockReturnValue({
          type: "user.deleted",
          data: { id: "user_nonexistent" },
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserDeleteMany.mockResolvedValue({ count: 0 });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({
              type: "user.deleted",
              data: { id: "user_nonexistent" },
            }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockTransaction).not.toHaveBeenCalled();
        expect(mockFavoriteDeleteMany).not.toHaveBeenCalled();
        expect(mockSearchHistoryDeleteMany).not.toHaveBeenCalled();
        expect(mockFilterPreferenceDeleteMany).not.toHaveBeenCalled();
        expect(mockUserEventDeleteMany).not.toHaveBeenCalled();
        expect(mockConversionEventDeleteMany).not.toHaveBeenCalled();
        expect(mockEmailLogDeleteMany).not.toHaveBeenCalled();
      });
    });

    // ------------------------------------------------------------------
    // Unknown Event Types
    // ------------------------------------------------------------------

    describe("Unknown event types", () => {
      it("should return 200 for unhandled event types (no-op)", async () => {
        mockVerify.mockReturnValue({
          type: "session.created",
          data: { id: "sess_test123" },
        });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({
              type: "session.created",
              data: { id: "sess_test123" },
            }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(text).toBe("OK");
        expect(mockUserCreate).not.toHaveBeenCalled();
        expect(mockUserUpdate).not.toHaveBeenCalled();
        expect(mockUserDeleteMany).not.toHaveBeenCalled();
      });

      it("should return 200 for organization event types (no-op)", async () => {
        mockVerify.mockReturnValue({
          type: "organization.created",
          data: { id: "org_test123" },
        });

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({
              type: "organization.created",
              data: { id: "org_test123" },
            }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
      });
    });

    // ------------------------------------------------------------------
    // Database Error Handling
    // ------------------------------------------------------------------

    describe("Error handling", () => {
      it("should propagate database error during user creation", async () => {
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.created",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(null);
        mockUserCreate.mockRejectedValue(
          new Error("Database connection error"),
        );

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.created", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        // The route does not wrap the main DB operations in try/catch,
        // so unhandled rejections will propagate
        await expect(POST(request)).rejects.toThrow(
          "Database connection error",
        );
      });

      it("should propagate database error during user update", async () => {
        const userData = createClerkUserPayload();
        mockVerify.mockReturnValue({
          type: "user.updated",
          data: userData,
        });
        mockUserFindUnique.mockResolvedValue(mockDbUser);
        mockUserUpdate.mockRejectedValue(new Error("Database update error"));

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({ type: "user.updated", data: userData }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await expect(POST(request)).rejects.toThrow("Database update error");
      });

      it("should propagate database error during user deletion", async () => {
        mockVerify.mockReturnValue({
          type: "user.deleted",
          data: { id: "user_test123" },
        });
        mockUserDeleteMany.mockRejectedValue(
          new Error("Database delete error"),
        );

        const { POST } = await import("@/app/api/webhooks/clerk/route");

        const request = new Request(
          "http://localhost:3000/api/webhooks/clerk",
          {
            method: "POST",
            body: JSON.stringify({
              type: "user.deleted",
              data: { id: "user_test123" },
            }),
            headers: { "Content-Type": "application/json" },
          },
        );

        await expect(POST(request)).rejects.toThrow("Database delete error");
      });
    });
  });
});
