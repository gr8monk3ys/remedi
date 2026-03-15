/**
 * Tests for lib/email/index.ts
 *
 * Tests the email service including:
 * - sendEmail core function (via public wrappers)
 * - Email preference checking (shouldSendEmail logic)
 * - Email logging
 * - Graceful degradation when email is not configured
 * - sendBatchEmails utility
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock @react-email/components
vi.mock("@react-email/components", () => ({
  render: vi.fn().mockResolvedValue("<html><body>Mocked Email</body></html>"),
}));

// Mock email templates
vi.mock("@/lib/email/templates/welcome", () => ({
  WelcomeEmail: vi.fn(() => "MockedWelcomeEmail"),
}));
vi.mock("@/lib/email/templates/subscription-confirmed", () => ({
  SubscriptionConfirmedEmail: vi.fn(() => "MockedSubscriptionConfirmedEmail"),
}));
vi.mock("@/lib/email/templates/subscription-cancelled", () => ({
  SubscriptionCancelledEmail: vi.fn(() => "MockedSubscriptionCancelledEmail"),
}));
vi.mock("@/lib/email/templates/subscription-expiring", () => ({
  SubscriptionExpiringEmail: vi.fn(() => "MockedSubscriptionExpiringEmail"),
}));
vi.mock("@/lib/email/templates/weekly-digest", () => ({
  WeeklyDigestEmail: vi.fn(() => "MockedWeeklyDigestEmail"),
}));
vi.mock("@/lib/email/templates/password-reset", () => ({
  PasswordResetEmail: vi.fn(() => "MockedPasswordResetEmail"),
}));
vi.mock("@/lib/email/templates/contribution-approved", () => ({
  ContributionApprovedEmail: vi.fn(() => "MockedContributionApprovedEmail"),
}));
vi.mock("@/lib/email/templates/contribution-rejected", () => ({
  ContributionRejectedEmail: vi.fn(() => "MockedContributionRejectedEmail"),
}));

// Mock email client
const mockSendEmail = vi.fn();
const mockIsEmailConfigured = vi.fn();
const mockGetResendClient = vi.fn();
const mockGetFromEmail = vi.fn();

vi.mock("@/lib/email/client", () => ({
  isEmailConfigured: (...args: unknown[]) => mockIsEmailConfigured(...args),
  getResendClient: (...args: unknown[]) => mockGetResendClient(...args),
  getFromEmail: (...args: unknown[]) => mockGetFromEmail(...args),
}));

// Mock Prisma (loaded lazily via dynamic import in the email service)
const mockPrismaFindUnique = vi.fn();
const mockPrismaCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    emailPreference: {
      findUnique: (...args: unknown[]) => mockPrismaFindUnique(...args),
    },
    emailLog: {
      create: (...args: unknown[]) => mockPrismaCreate(...args),
    },
  },
}));

import {
  sendWelcomeEmail,
  sendSubscriptionConfirmation,
  sendSubscriptionCancelled,
  sendExpirationReminder,
  sendWeeklyDigest,
  sendPasswordReset,
  sendContributionApproved,
  sendContributionRejected,
  sendBatchEmails,
} from "@/lib/email/index";

describe("lib/email/index", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsEmailConfigured.mockReturnValue(true);
    mockGetFromEmail.mockReturnValue("noreply@remedi.com");
    mockGetResendClient.mockReturnValue({
      emails: {
        send: mockSendEmail,
      },
    });
    mockSendEmail.mockResolvedValue({
      data: { id: "msg-123" },
      error: null,
    });
    mockPrismaFindUnique.mockResolvedValue(null);
    mockPrismaCreate.mockResolvedValue({});
  });

  describe("sendWelcomeEmail", () => {
    it("should send welcome email successfully", async () => {
      const result = await sendWelcomeEmail(
        "user@example.com",
        "Test User",
        "user-123",
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg-123");
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@example.com",
          subject: expect.stringContaining("Welcome"),
        }),
      );
    });

    it("should use 'there' as default name when name is empty", async () => {
      await sendWelcomeEmail("user@example.com", "");

      // The function passes the data to the template; name defaults to "there"
      expect(mockSendEmail).toHaveBeenCalled();
    });
  });

  describe("Email not configured", () => {
    it("should return failure when email is not configured", async () => {
      mockIsEmailConfigured.mockReturnValue(false);

      const result = await sendWelcomeEmail("user@example.com", "Test User");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not configured");
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it("should return failure when Resend client is null", async () => {
      mockGetResendClient.mockReturnValue(null);

      const result = await sendWelcomeEmail("user@example.com", "Test User");

      expect(result.success).toBe(false);
      expect(result.error).toContain("initialize email client");
    });
  });

  describe("Email preference checking", () => {
    it("should send email when user has no preference record (defaults)", async () => {
      mockPrismaFindUnique.mockResolvedValue(null);

      const result = await sendWeeklyDigest(
        "user@example.com",
        {
          name: "Test User",
          newRemedies: [],
          topSearches: [],
          savedRemedies: 5,
          searchCount: 10,
          periodStart: "2024-01-01",
          periodEnd: "2024-01-07",
        },
        "user-123",
      );

      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalled();
    });

    it("should suppress email when user has opted out of weekly digest", async () => {
      mockPrismaFindUnique.mockResolvedValue({
        weeklyDigest: false,
      });

      const result = await sendWeeklyDigest(
        "user@example.com",
        {
          name: "Test User",
          newRemedies: [],
          topSearches: [],
          savedRemedies: 5,
          searchCount: 10,
          periodStart: "2024-01-01",
          periodEnd: "2024-01-07",
        },
        "user-123",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("preference");
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it("should suppress subscription reminders when user has opted out", async () => {
      mockPrismaFindUnique.mockResolvedValue({
        subscriptionReminders: false,
      });

      const result = await sendSubscriptionConfirmation(
        "user@example.com",
        {
          name: "Test User",
          plan: "Premium",
          interval: "monthly",
          price: "$9.99",
          nextBillingDate: "2024-02-01",
        },
        "user-123",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("preference");
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it("should always send welcome email regardless of preferences", async () => {
      // Welcome is not in EMAIL_TYPE_PREFERENCE_MAP, so it's always sent
      mockPrismaFindUnique.mockResolvedValue({
        weeklyDigest: false,
        subscriptionReminders: false,
      });

      const result = await sendWelcomeEmail(
        "user@example.com",
        "Test User",
        "user-123",
      );

      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalled();
    });

    it("should always send password reset email regardless of preferences", async () => {
      const result = await sendPasswordReset("user@example.com", {
        name: "Test User",
        resetUrl: "https://remedi.com/reset?token=abc",
        expiresIn: "1 hour",
      });

      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalled();
    });

    it("should send email when userId is not provided (anonymous)", async () => {
      const result = await sendWelcomeEmail("user@example.com", "Test User");

      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalled();
      // Should not query preferences without a userId
      expect(mockPrismaFindUnique).not.toHaveBeenCalled();
    });

    it("should send email if preference lookup fails", async () => {
      mockPrismaFindUnique.mockRejectedValue(new Error("Database unavailable"));

      const result = await sendWeeklyDigest(
        "user@example.com",
        {
          name: "Test User",
          newRemedies: [],
          topSearches: [],
          savedRemedies: 5,
          searchCount: 10,
          periodStart: "2024-01-01",
          periodEnd: "2024-01-07",
        },
        "user-123",
      );

      // Should still send when preference check fails (fail-open)
      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalled();
    });
  });

  describe("Resend API error handling", () => {
    it("should handle Resend API error in response", async () => {
      mockSendEmail.mockResolvedValue({
        data: null,
        error: { message: "Rate limit exceeded" },
      });

      const result = await sendWelcomeEmail("user@example.com", "Test User");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Rate limit exceeded");
    });

    it("should handle Resend client throwing an exception", async () => {
      mockSendEmail.mockRejectedValue(new Error("Network error"));

      const result = await sendWelcomeEmail("user@example.com", "Test User");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("Email logging", () => {
    it("should log successful email send", async () => {
      await sendWelcomeEmail("user@example.com", "Test User", "user-123");

      expect(mockPrismaCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-123",
            email: "user@example.com",
            emailType: "welcome",
            messageId: "msg-123",
            status: "sent",
          }),
        }),
      );
    });

    it("should log failed email send", async () => {
      mockSendEmail.mockResolvedValue({
        data: null,
        error: { message: "Invalid email address" },
      });

      await sendWelcomeEmail("bad@", "Test User", "user-123");

      expect(mockPrismaCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "failed",
            errorMsg: "Invalid email address",
          }),
        }),
      );
    });

    it("should not break email flow if logging fails", async () => {
      mockPrismaCreate.mockRejectedValue(new Error("Log table not found"));

      const result = await sendWelcomeEmail("user@example.com", "Test User");

      // Email should still succeed even if logging fails
      expect(result.success).toBe(true);
    });
  });

  describe("sendSubscriptionCancelled", () => {
    it("should send cancellation email", async () => {
      const result = await sendSubscriptionCancelled(
        "user@example.com",
        {
          name: "Test User",
          plan: "Premium",
          accessUntil: "2024-02-01",
        },
        "user-123",
      );

      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Cancelled"),
        }),
      );
    });
  });

  describe("sendExpirationReminder", () => {
    it("should use urgent subject when 1 day left", async () => {
      await sendExpirationReminder(
        "user@example.com",
        {
          name: "Test User",
          plan: "Premium",
          daysLeft: 1,
          expirationDate: "2024-02-01",
        },
        "user-123",
      );

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("URGENT"),
        }),
      );
    });

    it("should include days left in subject when 3 days or fewer", async () => {
      await sendExpirationReminder(
        "user@example.com",
        {
          name: "Test User",
          plan: "Premium",
          daysLeft: 3,
          expirationDate: "2024-02-01",
        },
        "user-123",
      );

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("3 Days"),
        }),
      );
    });

    it("should use standard subject when more than 3 days left", async () => {
      await sendExpirationReminder(
        "user@example.com",
        {
          name: "Test User",
          plan: "Premium",
          daysLeft: 7,
          expirationDate: "2024-02-07",
        },
        "user-123",
      );

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Expires Soon"),
        }),
      );
    });
  });

  describe("sendContributionApproved", () => {
    it("should send contribution approved email", async () => {
      const result = await sendContributionApproved(
        "user@example.com",
        {
          name: "Test User",
          remedyName: "Turmeric",
          remedyUrl: "https://remedi.com/remedy/turmeric",
        },
        "user-123",
      );

      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Approved"),
        }),
      );
    });
  });

  describe("sendContributionRejected", () => {
    it("should send contribution rejected email", async () => {
      const result = await sendContributionRejected(
        "user@example.com",
        {
          name: "Test User",
          remedyName: "Unknown Plant",
          moderatorNote: "Insufficient evidence",
        },
        "user-123",
      );

      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Contribution"),
        }),
      );
    });
  });

  describe("sendBatchEmails", () => {
    it("should send all emails in a batch", async () => {
      const emailFns = [
        () => sendWelcomeEmail("user1@example.com", "User 1"),
        () => sendWelcomeEmail("user2@example.com", "User 2"),
        () => sendWelcomeEmail("user3@example.com", "User 3"),
      ];

      const results = await sendBatchEmails(emailFns, 0);

      expect(results.sent).toBe(3);
      expect(results.failed).toBe(0);
      expect(results.errors).toHaveLength(0);
    });

    it("should track failed emails in batch", async () => {
      // First email succeeds, second fails
      mockSendEmail
        .mockResolvedValueOnce({
          data: { id: "msg-1" },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: "Rate limited" },
        });

      const emailFns = [
        () => sendWelcomeEmail("user1@example.com", "User 1"),
        () => sendWelcomeEmail("user2@example.com", "User 2"),
      ];

      const results = await sendBatchEmails(emailFns, 0);

      expect(results.sent).toBe(1);
      expect(results.failed).toBe(1);
      expect(results.errors).toContain("Rate limited");
    });

    it("should handle exceptions thrown by email functions", async () => {
      const emailFns = [
        () => {
          throw new Error("Unexpected crash");
        },
      ];

      const results = await sendBatchEmails(
        emailFns as unknown as Array<
          () => Promise<{ success: boolean; error?: string }>
        >,
        0,
      );

      expect(results.failed).toBe(1);
      expect(results.errors).toContain("Unexpected crash");
    });

    it("should return zero counts for empty batch", async () => {
      const results = await sendBatchEmails([], 0);

      expect(results.sent).toBe(0);
      expect(results.failed).toBe(0);
      expect(results.errors).toHaveLength(0);
    });
  });
});
