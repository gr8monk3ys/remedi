/**
 * Comprehensive Tests for Email Service
 *
 * Covers:
 * - Email client (Resend initialization, graceful degradation)
 * - Email config (URLs, subjects, brand)
 * - Email templates (rendering all template types)
 * - Email service (sending functions, preference checking, batch sends)
 * - Digest builder (data assembly per plan tier)
 * - Types and defaults
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@react-email/components";

// ============================================================================
// Mocks
// ============================================================================

// Mock env module
const mockEnv = {
  hasResendEmail: vi.fn(() => true),
  getResendApiKey: vi.fn(() => "test-resend-api-key"),
  getEmailFrom: vi.fn(() => "Remedi <noreply@remedi.com>"),
};

vi.mock("@/lib/env", () => mockEnv);

// Mock url module
vi.mock("@/lib/url", () => ({
  getBaseUrl: vi.fn(() => "https://remedi.app"),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// Mock Resend
const mockEmailsSend = vi.fn();

vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      emails = { send: mockEmailsSend };
    },
  };
});

// Mock Prisma (used by email service index.ts and digest-builder.ts)
const mockPrisma = {
  emailPreference: {
    findUnique: vi.fn(),
  },
  emailLog: {
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  naturalRemedy: {
    findMany: vi.fn(),
  },
  searchHistory: {
    groupBy: vi.fn(),
    count: vi.fn(),
  },
  favorite: {
    count: vi.fn(),
  },
  healthProfile: {
    findUnique: vi.fn(),
  },
  medicationCabinet: {
    findMany: vi.fn(),
  },
  drugInteraction: {
    findMany: vi.fn(),
  },
  remedyJournal: {
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/db/client", () => ({
  prisma: mockPrisma,
}));

// ============================================================================
// Email Client Tests
// ============================================================================

describe("Email Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.hasResendEmail.mockReturnValue(true);
    mockEnv.getResendApiKey.mockReturnValue("test-resend-api-key");
    mockEnv.getEmailFrom.mockReturnValue("Remedi <noreply@remedi.com>");
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("should report email as configured when RESEND_API_KEY is present", async () => {
    const { isEmailConfigured } = await import("../email/client");

    const result = isEmailConfigured();

    expect(result).toBe(true);
    expect(mockEnv.hasResendEmail).toHaveBeenCalled();
  });

  it("should report email as not configured when RESEND_API_KEY is missing", async () => {
    mockEnv.hasResendEmail.mockReturnValue(false);

    const { isEmailConfigured } = await import("../email/client");

    const result = isEmailConfigured();

    expect(result).toBe(false);
  });

  it("should return a Resend client when properly configured", async () => {
    const { getResendClient, resetClient } = await import("../email/client");
    resetClient();

    const client = getResendClient();

    expect(client).not.toBeNull();
    expect(client).toHaveProperty("emails");
  });

  it("should return null when email is not configured", async () => {
    mockEnv.hasResendEmail.mockReturnValue(false);
    const { getResendClient, resetClient } = await import("../email/client");
    resetClient();

    const client = getResendClient();

    expect(client).toBeNull();
  });

  it("should return null when API key is empty", async () => {
    mockEnv.getResendApiKey.mockReturnValue(undefined);
    const { getResendClient, resetClient } = await import("../email/client");
    resetClient();
    // hasResendEmail still returns true but getResendApiKey returns undefined
    const client = getResendClient();

    expect(client).toBeNull();
  });

  it("should reuse the same client instance on subsequent calls", async () => {
    const { getResendClient, resetClient } = await import("../email/client");
    resetClient();

    const client1 = getResendClient();
    const client2 = getResendClient();

    expect(client1).toBe(client2);
  });

  it("should create a fresh client after resetClient is called", async () => {
    const { getResendClient, resetClient } = await import("../email/client");
    resetClient();

    const client1 = getResendClient();
    resetClient();
    const client2 = getResendClient();

    // After reset, a new instance is created (different reference)
    expect(client1).not.toBe(client2);
    expect(client1).not.toBeNull();
    expect(client2).not.toBeNull();
  });

  it("should return the configured from email address", async () => {
    const { getFromEmail } = await import("../email/client");

    const from = getFromEmail();

    expect(from).toBe("Remedi <noreply@remedi.com>");
  });
});

// ============================================================================
// Email Config Tests
// ============================================================================

describe("Email Config", () => {
  it("should define rate limits with valid values", async () => {
    const { EMAIL_RATE_LIMITS } = await import("../email/config");

    expect(EMAIL_RATE_LIMITS.perHour).toBe(10);
    expect(EMAIL_RATE_LIMITS.perDay).toBe(50);
    expect(EMAIL_RATE_LIMITS.windowMs).toBe(3_600_000);
  });

  it("should define brand configuration", async () => {
    const { EMAIL_BRAND } = await import("../email/config");

    expect(EMAIL_BRAND.name).toBe("Remedi");
    expect(EMAIL_BRAND.tagline).toBe("Natural Alternatives to Pharmaceuticals");
    expect(EMAIL_BRAND.primaryColor).toBe("#10B981");
  });

  it("should define all required email subjects", async () => {
    const { EMAIL_SUBJECTS } = await import("../email/config");

    expect(EMAIL_SUBJECTS.welcome).toContain("Welcome");
    expect(EMAIL_SUBJECTS.subscription_confirmed).toContain("Subscription");
    expect(EMAIL_SUBJECTS.subscription_cancelled).toContain("Cancelled");
    expect(EMAIL_SUBJECTS.subscription_expiring).toContain("Expires");
    expect(EMAIL_SUBJECTS.weekly_digest).toContain("Digest");
    expect(EMAIL_SUBJECTS.password_reset).toContain("Reset");
    expect(EMAIL_SUBJECTS.contribution_approved).toContain("Approved");
    expect(EMAIL_SUBJECTS.contribution_rejected).toContain("Contribution");
  });

  it("should generate full URL from relative path", async () => {
    const { getEmailUrl } = await import("../email/config");

    const url = getEmailUrl("/test-path");

    expect(url).toBe("https://remedi.app/test-path");
  });

  it("should generate unsubscribe URL with userId", async () => {
    const { getUnsubscribeUrl } = await import("../email/config");

    const url = getUnsubscribeUrl("user-123");

    expect(url).toContain("/settings/email-preferences");
    expect(url).toContain("userId=user-123");
  });

  it("should include email type in unsubscribe URL when provided", async () => {
    const { getUnsubscribeUrl } = await import("../email/config");

    const url = getUnsubscribeUrl("user-123", "weekly_digest");

    expect(url).toContain("userId=user-123");
    expect(url).toContain("type=weekly_digest");
  });

  it("should define all expected email URL paths", async () => {
    const { EMAIL_URLS } = await import("../email/config");

    expect(EMAIL_URLS.home).toBe("/");
    expect(EMAIL_URLS.login).toBe("/sign-in");
    expect(EMAIL_URLS.unsubscribe).toBe("/settings/email-preferences");
    expect(EMAIL_URLS.manageSubscription).toBe("/settings/subscription");
    expect(EMAIL_URLS.contribute).toBe("/contribute");
  });
});

// ============================================================================
// Email Types Tests
// ============================================================================

describe("Email Types", () => {
  it("should define default email preferences with sensible defaults", async () => {
    const { DEFAULT_EMAIL_PREFERENCES } = await import("../email/types");

    expect(DEFAULT_EMAIL_PREFERENCES.weeklyDigest).toBe(true);
    expect(DEFAULT_EMAIL_PREFERENCES.marketingEmails).toBe(false);
    expect(DEFAULT_EMAIL_PREFERENCES.productUpdates).toBe(true);
    expect(DEFAULT_EMAIL_PREFERENCES.subscriptionReminders).toBe(true);
  });
});

// ============================================================================
// Email Template Tests
// ============================================================================

describe("Email Templates", () => {
  describe("WelcomeEmail", () => {
    it("should render with user name", async () => {
      const { WelcomeEmail } = await import("../email/templates/welcome");

      const html = await render(
        WelcomeEmail({
          name: "Alice",
          loginUrl: "https://remedi.app/sign-in",
        }),
      );

      expect(html).toContain("Alice");
      expect(html).toContain("Welcome to Remedi");
      expect(html).toContain("Start Exploring");
    });

    it("should include login URL in the CTA", async () => {
      const { WelcomeEmail } = await import("../email/templates/welcome");

      const html = await render(
        WelcomeEmail({
          name: "Bob",
          loginUrl: "https://remedi.app/sign-in",
        }),
      );

      expect(html).toContain("https://remedi.app/sign-in");
    });

    it("should include medical disclaimer", async () => {
      const { WelcomeEmail } = await import("../email/templates/welcome");

      const html = await render(
        WelcomeEmail({
          name: "Charlie",
          loginUrl: "https://remedi.app/sign-in",
        }),
      );

      expect(html).toContain("Medical Disclaimer");
      expect(html).toContain("informational purposes only");
    });

    it("should include unsubscribe link when userId is provided", async () => {
      const { WelcomeEmail } = await import("../email/templates/welcome");

      const html = await render(
        WelcomeEmail({
          name: "Dana",
          loginUrl: "https://remedi.app/sign-in",
          userId: "user-456",
        }),
      );

      expect(html).toContain("Unsubscribe");
      expect(html).toContain("user-456");
    });

    it("should not include unsubscribe link when userId is omitted", async () => {
      const { WelcomeEmail } = await import("../email/templates/welcome");

      const html = await render(
        WelcomeEmail({
          name: "Eve",
          loginUrl: "https://remedi.app/sign-in",
        }),
      );

      expect(html).not.toContain("Unsubscribe");
    });

    it("should fall back to config login URL when loginUrl is omitted", async () => {
      const { WelcomeEmail } = await import("../email/templates/welcome");

      const html = await render(
        WelcomeEmail({
          name: "Frank",
        }),
      );

      expect(html).toContain("https://remedi.app/sign-in");
    });
  });

  describe("SubscriptionConfirmedEmail", () => {
    const defaultProps = {
      name: "Alice",
      plan: "Premium",
      interval: "monthly" as const,
      price: "$9.99",
      nextBillingDate: "Feb 1, 2026",
      manageUrl: "https://remedi.app/settings/subscription",
    };

    it("should render subscription details", async () => {
      const { SubscriptionConfirmedEmail } =
        await import("../email/templates/subscription-confirmed");

      const html = await render(SubscriptionConfirmedEmail(defaultProps));

      expect(html).toContain("Alice");
      expect(html).toContain("Premium");
      expect(html).toContain("$9.99");
      expect(html).toContain("Feb 1, 2026");
      expect(html).toContain("Subscription Confirmed");
    });

    it("should display monthly billing cycle", async () => {
      const { SubscriptionConfirmedEmail } =
        await import("../email/templates/subscription-confirmed");

      const html = await render(SubscriptionConfirmedEmail(defaultProps));

      expect(html).toContain("Monthly");
      // React Email inserts <!-- --> between JSX expressions, so check parts
      expect(html).toContain("$9.99");
      expect(html).toContain("month");
    });

    it("should display yearly billing cycle", async () => {
      const { SubscriptionConfirmedEmail } =
        await import("../email/templates/subscription-confirmed");

      const html = await render(
        SubscriptionConfirmedEmail({ ...defaultProps, interval: "yearly" }),
      );

      expect(html).toContain("Annual");
      expect(html).toContain("$9.99");
      expect(html).toContain("year");
    });

    it("should include manage subscription button", async () => {
      const { SubscriptionConfirmedEmail } =
        await import("../email/templates/subscription-confirmed");

      const html = await render(SubscriptionConfirmedEmail(defaultProps));

      expect(html).toContain("Manage Subscription");
      expect(html).toContain("https://remedi.app/settings/subscription");
    });
  });

  describe("SubscriptionCancelledEmail", () => {
    const defaultProps = {
      name: "Bob",
      plan: "Basic",
      accessUntil: "Mar 15, 2026",
      resubscribeUrl: "https://remedi.app/settings/subscription",
    };

    it("should render cancellation details", async () => {
      const { SubscriptionCancelledEmail } =
        await import("../email/templates/subscription-cancelled");

      const html = await render(SubscriptionCancelledEmail(defaultProps));

      expect(html).toContain("Bob");
      expect(html).toContain("Basic");
      expect(html).toContain("Mar 15, 2026");
      expect(html).toContain("Subscription Cancelled");
    });

    it("should include resubscribe CTA", async () => {
      const { SubscriptionCancelledEmail } =
        await import("../email/templates/subscription-cancelled");

      const html = await render(SubscriptionCancelledEmail(defaultProps));

      expect(html).toContain("Resubscribe Now");
    });

    it("should list features the user will miss", async () => {
      const { SubscriptionCancelledEmail } =
        await import("../email/templates/subscription-cancelled");

      const html = await render(SubscriptionCancelledEmail(defaultProps));

      expect(html).toContain("AI-powered remedy recommendations");
      expect(html).toContain("Drug interaction checking");
    });
  });

  describe("SubscriptionExpiringEmail", () => {
    const defaultProps = {
      name: "Charlie",
      plan: "Premium",
      daysLeft: 7,
      expirationDate: "Mar 20, 2026",
      renewUrl: "https://remedi.app/settings/subscription",
    };

    it("should render expiration details", async () => {
      const { SubscriptionExpiringEmail } =
        await import("../email/templates/subscription-expiring");

      const html = await render(SubscriptionExpiringEmail(defaultProps));

      expect(html).toContain("Charlie");
      expect(html).toContain("Premium");
      expect(html).toContain("Mar 20, 2026");
    });

    it("should show days left banner", async () => {
      const { SubscriptionExpiringEmail } =
        await import("../email/templates/subscription-expiring");

      const html = await render(SubscriptionExpiringEmail(defaultProps));

      expect(html).toContain("7 DAYS LEFT");
    });

    it("should show urgent banner when expiring tomorrow", async () => {
      const { SubscriptionExpiringEmail } =
        await import("../email/templates/subscription-expiring");

      const html = await render(
        SubscriptionExpiringEmail({ ...defaultProps, daysLeft: 1 }),
      );

      expect(html).toContain("EXPIRES TOMORROW");
    });

    it("should include renew subscription button", async () => {
      const { SubscriptionExpiringEmail } =
        await import("../email/templates/subscription-expiring");

      const html = await render(SubscriptionExpiringEmail(defaultProps));

      expect(html).toContain("Renew Subscription");
    });
  });

  describe("WeeklyDigestEmail", () => {
    const defaultProps = {
      name: "Dana",
      newRemedies: [
        {
          name: "Turmeric",
          category: "Herbal",
          url: "https://remedi.app/remedy/1",
        },
        {
          name: "Ginger",
          category: "Herbal",
          url: "https://remedi.app/remedy/2",
        },
      ],
      topSearches: [
        { query: "headache", count: 150 },
        { query: "insomnia", count: 120 },
      ],
      savedRemedies: 5,
      searchCount: 12,
      periodStart: "Mar 1",
      periodEnd: "Mar 7, 2026",
    };

    it("should render digest with activity stats", async () => {
      const { WeeklyDigestEmail } =
        await import("../email/templates/weekly-digest");

      const html = await render(WeeklyDigestEmail(defaultProps));

      expect(html).toContain("Dana");
      expect(html).toContain("Your Weekly Digest");
      expect(html).toContain("Mar 1");
      expect(html).toContain("Mar 7, 2026");
      expect(html).toContain("12"); // searchCount
      expect(html).toContain("5"); // savedRemedies
    });

    it("should list new remedies", async () => {
      const { WeeklyDigestEmail } =
        await import("../email/templates/weekly-digest");

      const html = await render(WeeklyDigestEmail(defaultProps));

      expect(html).toContain("Turmeric");
      expect(html).toContain("Ginger");
      expect(html).toContain("New Remedies Added");
    });

    it("should list trending searches", async () => {
      const { WeeklyDigestEmail } =
        await import("../email/templates/weekly-digest");

      const html = await render(WeeklyDigestEmail(defaultProps));

      expect(html).toContain("headache");
      expect(html).toContain("insomnia");
      expect(html).toContain("Trending Searches");
    });

    it("should render with empty remedies and searches", async () => {
      const { WeeklyDigestEmail } =
        await import("../email/templates/weekly-digest");

      const html = await render(
        WeeklyDigestEmail({
          ...defaultProps,
          newRemedies: [],
          topSearches: [],
        }),
      );

      expect(html).toContain("Dana");
      expect(html).not.toContain("New Remedies Added");
      expect(html).not.toContain("Trending Searches");
    });

    it("should render AI insight section when provided", async () => {
      const { WeeklyDigestEmail } =
        await import("../email/templates/weekly-digest");

      const html = await render(
        WeeklyDigestEmail({
          ...defaultProps,
          aiInsight: "Great progress this week! Keep going.",
        }),
      );

      expect(html).toContain("AI Health Insight");
      expect(html).toContain("Great progress this week! Keep going.");
    });

    it("should not render AI insight section when omitted", async () => {
      const { WeeklyDigestEmail } =
        await import("../email/templates/weekly-digest");

      const html = await render(WeeklyDigestEmail(defaultProps));

      expect(html).not.toContain("AI Health Insight");
    });

    it("should render journal summary when provided", async () => {
      const { WeeklyDigestEmail } =
        await import("../email/templates/weekly-digest");

      const html = await render(
        WeeklyDigestEmail({
          ...defaultProps,
          journalSummary: {
            entriesThisWeek: 5,
            avgRating: 4.2,
            topRemedy: "Chamomile",
          },
        }),
      );

      expect(html).toContain("Journal This Week");
      expect(html).toContain("5");
      expect(html).toContain("4.2");
      expect(html).toContain("Chamomile");
    });

    it("should render interaction alerts when provided", async () => {
      const { WeeklyDigestEmail } =
        await import("../email/templates/weekly-digest");

      const html = await render(
        WeeklyDigestEmail({
          ...defaultProps,
          interactionAlerts: [
            {
              medication: "Aspirin",
              substance: "Ginkgo",
              severity: "moderate",
              description: "May increase bleeding risk",
            },
          ],
        }),
      );

      expect(html).toContain("Interaction Alerts");
      expect(html).toContain("Aspirin");
      expect(html).toContain("Ginkgo");
      expect(html).toContain("moderate");
    });

    it("should render personalized remedies when provided", async () => {
      const { WeeklyDigestEmail } =
        await import("../email/templates/weekly-digest");

      const html = await render(
        WeeklyDigestEmail({
          ...defaultProps,
          personalizedRemedies: [
            {
              name: "Valerian Root",
              category: "Sleep",
              matchReason: "Matches your sleep interest",
              url: "https://remedi.app/remedy/3",
            },
          ],
        }),
      );

      expect(html).toContain("Personalized For You");
      expect(html).toContain("Valerian Root");
      expect(html).toContain("Matches your sleep interest");
    });

    it("should show overflow text when more than 5 new remedies", async () => {
      const { WeeklyDigestEmail } =
        await import("../email/templates/weekly-digest");

      const manyRemedies = Array.from({ length: 8 }, (_, i) => ({
        name: `Remedy ${i + 1}`,
        category: "Herbal",
        url: `https://remedi.app/remedy/${i + 1}`,
      }));

      const html = await render(
        WeeklyDigestEmail({ ...defaultProps, newRemedies: manyRemedies }),
      );

      // React Email inserts <!-- --> between JSX expressions, so check parts
      expect(html).toContain("more new remedies");
      expect(html).toMatch(/\+.*3.*more new remedies/);
    });
  });

  describe("PasswordResetEmail", () => {
    it("should render with reset URL and expiry", async () => {
      const { PasswordResetEmail } =
        await import("../email/templates/password-reset");

      const html = await render(
        PasswordResetEmail({
          name: "Eve",
          resetUrl: "https://remedi.app/reset/token-123",
          expiresIn: "1 hour",
        }),
      );

      expect(html).toContain("Eve");
      expect(html).toContain("Reset Your Password");
      expect(html).toContain("https://remedi.app/reset/token-123");
      expect(html).toContain("1 hour");
    });

    it("should include security notice for unsolicited requests", async () => {
      const { PasswordResetEmail } =
        await import("../email/templates/password-reset");

      const html = await render(
        PasswordResetEmail({
          name: "Eve",
          resetUrl: "https://remedi.app/reset/token-123",
          expiresIn: "1 hour",
        }),
      );

      expect(html).toContain("Did not request this");
      expect(html).toContain("safely ignore this email");
    });
  });

  describe("ContributionApprovedEmail", () => {
    it("should render with remedy name and link", async () => {
      const { ContributionApprovedEmail } =
        await import("../email/templates/contribution-approved");

      const html = await render(
        ContributionApprovedEmail({
          name: "Frank",
          remedyName: "Lavender Oil",
          remedyUrl: "https://remedi.app/remedy/lav-1",
        }),
      );

      expect(html).toContain("Frank");
      expect(html).toContain("Lavender Oil");
      expect(html).toContain("Contribution Approved");
      expect(html).toContain("View Your Remedy");
      expect(html).toContain("https://remedi.app/remedy/lav-1");
    });

    it("should contain a success checkmark section", async () => {
      const { ContributionApprovedEmail } =
        await import("../email/templates/contribution-approved");

      const html = await render(
        ContributionApprovedEmail({
          name: "Frank",
          remedyName: "Lavender Oil",
          remedyUrl: "https://remedi.app/remedy/lav-1",
        }),
      );

      expect(html).toContain("is now live");
    });
  });

  describe("ContributionRejectedEmail", () => {
    it("should render with remedy name and contribute link", async () => {
      const { ContributionRejectedEmail } =
        await import("../email/templates/contribution-rejected");

      const html = await render(
        ContributionRejectedEmail({
          name: "Grace",
          remedyName: "Mystery Herb",
          contributeUrl: "https://remedi.app/contribute",
        }),
      );

      expect(html).toContain("Grace");
      expect(html).toContain("Mystery Herb");
      expect(html).toContain("Update on Your Contribution");
      expect(html).toContain("Submit Another Remedy");
    });

    it("should include moderator note when provided", async () => {
      const { ContributionRejectedEmail } =
        await import("../email/templates/contribution-rejected");

      const html = await render(
        ContributionRejectedEmail({
          name: "Grace",
          remedyName: "Mystery Herb",
          moderatorNote: "Please provide scientific references.",
          contributeUrl: "https://remedi.app/contribute",
        }),
      );

      expect(html).toContain("Moderator Feedback");
      expect(html).toContain("Please provide scientific references.");
    });

    it("should not render moderator note section when omitted", async () => {
      const { ContributionRejectedEmail } =
        await import("../email/templates/contribution-rejected");

      const html = await render(
        ContributionRejectedEmail({
          name: "Grace",
          remedyName: "Mystery Herb",
          contributeUrl: "https://remedi.app/contribute",
        }),
      );

      expect(html).not.toContain("Moderator Feedback");
    });

    it("should include tips for future submissions", async () => {
      const { ContributionRejectedEmail } =
        await import("../email/templates/contribution-rejected");

      const html = await render(
        ContributionRejectedEmail({
          name: "Grace",
          remedyName: "Mystery Herb",
          contributeUrl: "https://remedi.app/contribute",
        }),
      );

      expect(html).toContain("Tips for Future Submissions");
      expect(html).toContain("scientific references");
    });
  });

  describe("BaseLayout", () => {
    it("should render with preview text and branded header", async () => {
      const { BaseLayout } = await import("../email/templates/base-layout");
      const React = await import("react");

      const html = await render(
        BaseLayout({
          preview: "Test preview text",
          children: React.createElement("p", null, "Test content"),
        }),
      );

      expect(html).toContain("Test preview text");
      expect(html).toContain("Remedi");
      expect(html).toContain("Natural Alternatives to Pharmaceuticals");
      expect(html).toContain("Test content");
    });

    it("should include footer with privacy and terms links", async () => {
      const { BaseLayout } = await import("../email/templates/base-layout");
      const React = await import("react");

      const html = await render(
        BaseLayout({
          preview: "Footer test",
          children: React.createElement("p", null, "Body"),
        }),
      );

      expect(html).toContain("Privacy Policy");
      expect(html).toContain("Terms of Service");
      expect(html).toContain("support@remedi.com");
    });

    it("should include unsubscribe link when URL is provided", async () => {
      const { BaseLayout } = await import("../email/templates/base-layout");
      const React = await import("react");

      const html = await render(
        BaseLayout({
          preview: "Unsub test",
          children: React.createElement("p", null, "Body"),
          unsubscribeUrl: "https://remedi.app/unsubscribe/abc",
        }),
      );

      expect(html).toContain("Unsubscribe");
      expect(html).toContain("https://remedi.app/unsubscribe/abc");
    });

    it("should not include unsubscribe link when URL is omitted", async () => {
      const { BaseLayout } = await import("../email/templates/base-layout");
      const React = await import("react");

      const html = await render(
        BaseLayout({
          preview: "No unsub",
          children: React.createElement("p", null, "Body"),
        }),
      );

      expect(html).not.toContain("Unsubscribe");
    });
  });
});

// ============================================================================
// Email Service (index.ts) Tests
// ============================================================================

describe("Email Service", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockEnv.hasResendEmail.mockReturnValue(true);
    mockEnv.getResendApiKey.mockReturnValue("test-resend-api-key");
    mockEnv.getEmailFrom.mockReturnValue("Remedi <noreply@remedi.com>");
    mockEmailsSend.mockResolvedValue({
      data: { id: "msg-123" },
      error: null,
    });
    mockPrisma.emailPreference.findUnique.mockResolvedValue(null);
    mockPrisma.emailLog.create.mockResolvedValue({});
    // Reset the Resend singleton so each test starts clean
    const { resetClient } = await import("../email/client");
    resetClient();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("sendWelcomeEmail", () => {
    it("should send a welcome email successfully", async () => {
      const { sendWelcomeEmail } = await import("../email/index");

      const result = await sendWelcomeEmail("alice@example.com", "Alice");

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg-123");
      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "Remedi <noreply@remedi.com>",
          to: "alice@example.com",
          subject: expect.stringContaining("Welcome"),
          html: expect.any(String),
        }),
      );
    });

    it("should log the send attempt to the database", async () => {
      const { sendWelcomeEmail } = await import("../email/index");

      await sendWelcomeEmail("alice@example.com", "Alice", "user-1");

      expect(mockPrisma.emailLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          email: "alice@example.com",
          emailType: "welcome",
          status: "sent",
          messageId: "msg-123",
        }),
      });
    });

    it('should use "there" as fallback name when name is empty', async () => {
      const { sendWelcomeEmail } = await import("../email/index");

      const result = await sendWelcomeEmail("user@example.com", "");

      expect(result.success).toBe(true);
      // The html should contain "there" as fallback
      const sentHtml = mockEmailsSend.mock.calls[0][0].html;
      expect(sentHtml).toContain("there");
    });
  });

  describe("sendSubscriptionConfirmation", () => {
    it("should send subscription confirmation email", async () => {
      const { sendSubscriptionConfirmation } = await import("../email/index");

      const result = await sendSubscriptionConfirmation(
        "bob@example.com",
        {
          name: "Bob",
          plan: "Premium",
          interval: "monthly",
          price: "$9.99",
          nextBillingDate: "Apr 1, 2026",
        },
        "user-2",
      );

      expect(result.success).toBe(true);
      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "bob@example.com",
          subject: expect.stringContaining("Subscription"),
        }),
      );
    });

    it("should auto-populate manageUrl from config", async () => {
      const { sendSubscriptionConfirmation } = await import("../email/index");

      await sendSubscriptionConfirmation("bob@example.com", {
        name: "Bob",
        plan: "Premium",
        interval: "monthly",
        price: "$9.99",
        nextBillingDate: "Apr 1, 2026",
      });

      const sentHtml = mockEmailsSend.mock.calls[0][0].html;
      expect(sentHtml).toContain("/settings/subscription");
    });
  });

  describe("sendSubscriptionCancelled", () => {
    it("should send subscription cancelled email", async () => {
      const { sendSubscriptionCancelled } = await import("../email/index");

      const result = await sendSubscriptionCancelled("bob@example.com", {
        name: "Bob",
        plan: "Basic",
        accessUntil: "Apr 15, 2026",
      });

      expect(result.success).toBe(true);
      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Cancelled"),
        }),
      );
    });
  });

  describe("sendExpirationReminder", () => {
    it("should send standard expiration reminder", async () => {
      const { sendExpirationReminder } = await import("../email/index");

      const result = await sendExpirationReminder("user@example.com", {
        name: "Charlie",
        plan: "Premium",
        daysLeft: 7,
        expirationDate: "Mar 20, 2026",
      });

      expect(result.success).toBe(true);
      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Expires"),
        }),
      );
    });

    it("should use urgent subject when expiring tomorrow", async () => {
      const { sendExpirationReminder } = await import("../email/index");

      await sendExpirationReminder("user@example.com", {
        name: "Charlie",
        plan: "Premium",
        daysLeft: 1,
        expirationDate: "Mar 14, 2026",
      });

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("URGENT"),
        }),
      );
    });

    it("should use days-specific subject when 3 days left", async () => {
      const { sendExpirationReminder } = await import("../email/index");

      await sendExpirationReminder("user@example.com", {
        name: "Charlie",
        plan: "Premium",
        daysLeft: 3,
        expirationDate: "Mar 16, 2026",
      });

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("3 Days"),
        }),
      );
    });
  });

  describe("sendWeeklyDigest", () => {
    it("should send weekly digest email with period in subject", async () => {
      const { sendWeeklyDigest } = await import("../email/index");

      const result = await sendWeeklyDigest(
        "user@example.com",
        {
          name: "Dana",
          newRemedies: [],
          topSearches: [],
          savedRemedies: 3,
          searchCount: 8,
          periodStart: "Mar 1",
          periodEnd: "Mar 7, 2026",
        },
        "user-3",
      );

      expect(result.success).toBe(true);
      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Mar 1"),
        }),
      );
    });
  });

  describe("sendPasswordReset", () => {
    it("should send password reset email", async () => {
      const { sendPasswordReset } = await import("../email/index");

      const result = await sendPasswordReset("user@example.com", {
        name: "Eve",
        resetUrl: "https://remedi.app/reset/token-abc",
        expiresIn: "30 minutes",
      });

      expect(result.success).toBe(true);
      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Reset"),
        }),
      );
    });
  });

  describe("sendContributionApproved", () => {
    it("should send contribution approved email", async () => {
      const { sendContributionApproved } = await import("../email/index");

      const result = await sendContributionApproved(
        "user@example.com",
        {
          name: "Frank",
          remedyName: "Lavender Oil",
          remedyUrl: "https://remedi.app/remedy/lav-1",
        },
        "user-4",
      );

      expect(result.success).toBe(true);
      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Approved"),
        }),
      );
    });
  });

  describe("sendContributionRejected", () => {
    it("should send contribution rejected email", async () => {
      const { sendContributionRejected } = await import("../email/index");

      const result = await sendContributionRejected(
        "user@example.com",
        {
          name: "Grace",
          remedyName: "Unknown Herb",
          moderatorNote: "Needs more evidence.",
        },
        "user-5",
      );

      expect(result.success).toBe(true);
    });

    it("should auto-populate contributeUrl from config", async () => {
      const { sendContributionRejected } = await import("../email/index");

      await sendContributionRejected("user@example.com", {
        name: "Grace",
        remedyName: "Unknown Herb",
      });

      const sentHtml = mockEmailsSend.mock.calls[0][0].html;
      expect(sentHtml).toContain("/contribute");
    });
  });

  describe("Error Handling", () => {
    it("should return error when email service is not configured", async () => {
      mockEnv.hasResendEmail.mockReturnValue(false);

      const { sendWelcomeEmail } = await import("../email/index");
      // Reset client so it picks up the new hasResendEmail value
      const { resetClient } = await import("../email/client");
      resetClient();

      const result = await sendWelcomeEmail("user@example.com", "Test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not configured");
    });

    it("should handle Resend API errors gracefully", async () => {
      mockEmailsSend.mockResolvedValue({
        data: null,
        error: { message: "Invalid API key", name: "validation_error" },
      });

      const { sendWelcomeEmail } = await import("../email/index");

      const result = await sendWelcomeEmail("user@example.com", "Test");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid API key");
    });

    it("should handle send exceptions gracefully", async () => {
      mockEmailsSend.mockRejectedValue(new Error("Network timeout"));

      const { sendWelcomeEmail } = await import("../email/index");

      const result = await sendWelcomeEmail("user@example.com", "Test");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network timeout");
    });

    it("should log failed send to email log", async () => {
      mockEmailsSend.mockRejectedValue(new Error("Connection refused"));

      const { sendWelcomeEmail } = await import("../email/index");

      await sendWelcomeEmail("user@example.com", "Test", "user-err");

      expect(mockPrisma.emailLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: "failed",
          errorMsg: "Connection refused",
        }),
      });
    });

    it("should not crash when email logging itself fails", async () => {
      mockPrisma.emailLog.create.mockRejectedValue(
        new Error("DB connection lost"),
      );
      mockEmailsSend.mockResolvedValue({
        data: { id: "msg-ok" },
        error: null,
      });

      const { sendWelcomeEmail } = await import("../email/index");

      // Should still return success even if log write fails
      const result = await sendWelcomeEmail("user@example.com", "Test");

      expect(result.success).toBe(true);
    });
  });

  describe("Email Preference Checking", () => {
    it("should suppress weekly digest when user opted out", async () => {
      mockPrisma.emailPreference.findUnique.mockResolvedValue({
        weeklyDigest: false,
      });

      const { sendWeeklyDigest } = await import("../email/index");

      const result = await sendWeeklyDigest(
        "user@example.com",
        {
          name: "Opted Out User",
          newRemedies: [],
          topSearches: [],
          savedRemedies: 0,
          searchCount: 0,
          periodStart: "Mar 1",
          periodEnd: "Mar 7, 2026",
        },
        "user-optout",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("user preference");
      expect(mockEmailsSend).not.toHaveBeenCalled();
    });

    it("should suppress subscription emails when user opted out", async () => {
      mockPrisma.emailPreference.findUnique.mockResolvedValue({
        subscriptionReminders: false,
      });

      const { sendExpirationReminder } = await import("../email/index");

      const result = await sendExpirationReminder(
        "user@example.com",
        {
          name: "Opted Out",
          plan: "Basic",
          daysLeft: 5,
          expirationDate: "Mar 18, 2026",
        },
        "user-optout2",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("user preference");
    });

    it("should always send welcome email regardless of preferences", async () => {
      mockPrisma.emailPreference.findUnique.mockResolvedValue({
        weeklyDigest: false,
        subscriptionReminders: false,
      });

      const { sendWelcomeEmail } = await import("../email/index");

      const result = await sendWelcomeEmail(
        "user@example.com",
        "Test",
        "user-optout3",
      );

      expect(result.success).toBe(true);
    });

    it("should always send password reset email regardless of preferences", async () => {
      mockPrisma.emailPreference.findUnique.mockResolvedValue({
        weeklyDigest: false,
        subscriptionReminders: false,
      });

      const { sendPasswordReset } = await import("../email/index");

      const result = await sendPasswordReset("user@example.com", {
        name: "Test",
        resetUrl: "https://remedi.app/reset/xyz",
        expiresIn: "1 hour",
      });

      expect(result.success).toBe(true);
    });

    it("should send email when no preference record exists (defaults)", async () => {
      mockPrisma.emailPreference.findUnique.mockResolvedValue(null);

      const { sendWeeklyDigest } = await import("../email/index");

      const result = await sendWeeklyDigest(
        "user@example.com",
        {
          name: "New User",
          newRemedies: [],
          topSearches: [],
          savedRemedies: 0,
          searchCount: 0,
          periodStart: "Mar 1",
          periodEnd: "Mar 7, 2026",
        },
        "user-new",
      );

      expect(result.success).toBe(true);
    });

    it("should send email when no userId is provided", async () => {
      const { sendWeeklyDigest } = await import("../email/index");

      const result = await sendWeeklyDigest("anon@example.com", {
        name: "Anonymous",
        newRemedies: [],
        topSearches: [],
        savedRemedies: 0,
        searchCount: 0,
        periodStart: "Mar 1",
        periodEnd: "Mar 7, 2026",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.emailPreference.findUnique).not.toHaveBeenCalled();
    });

    it("should send email when preference check throws an error", async () => {
      mockPrisma.emailPreference.findUnique.mockRejectedValue(
        new Error("DB timeout"),
      );

      const { sendWeeklyDigest } = await import("../email/index");

      const result = await sendWeeklyDigest(
        "user@example.com",
        {
          name: "Failover",
          newRemedies: [],
          topSearches: [],
          savedRemedies: 0,
          searchCount: 0,
          periodStart: "Mar 1",
          periodEnd: "Mar 7, 2026",
        },
        "user-failover",
      );

      // Fails open: sends anyway when preference DB is unavailable
      expect(result.success).toBe(true);
    });
  });

  describe("sendBatchEmails", () => {
    it("should process multiple emails and report results", async () => {
      const { sendBatchEmails } = await import("../email/index");

      const emails = [
        vi.fn().mockResolvedValue({ success: true, messageId: "msg-1" }),
        vi.fn().mockResolvedValue({ success: true, messageId: "msg-2" }),
        vi.fn().mockResolvedValue({
          success: false,
          error: "Invalid recipient",
        }),
      ];

      const result = await sendBatchEmails(emails, 0);

      expect(result.sent).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toContain("Invalid recipient");
    });

    it("should handle exceptions from individual send functions", async () => {
      const { sendBatchEmails } = await import("../email/index");

      const emails = [
        vi.fn().mockResolvedValue({ success: true, messageId: "msg-1" }),
        vi.fn().mockRejectedValue(new Error("Catastrophic failure")),
      ];

      const result = await sendBatchEmails(emails, 0);

      expect(result.sent).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toContain("Catastrophic failure");
    });

    it("should handle empty batch gracefully", async () => {
      const { sendBatchEmails } = await import("../email/index");

      const result = await sendBatchEmails([], 0);

      expect(result.sent).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should process emails sequentially", async () => {
      const { sendBatchEmails } = await import("../email/index");
      const callOrder: number[] = [];

      const emails = [
        vi.fn().mockImplementation(async () => {
          callOrder.push(1);
          return { success: true };
        }),
        vi.fn().mockImplementation(async () => {
          callOrder.push(2);
          return { success: true };
        }),
        vi.fn().mockImplementation(async () => {
          callOrder.push(3);
          return { success: true };
        }),
      ];

      await sendBatchEmails(emails, 0);

      expect(callOrder).toEqual([1, 2, 3]);
    });
  });
});

// ============================================================================
// Digest Builder Tests
// ============================================================================

describe("Digest Builder", () => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue({
      name: "TestUser",
      email: "test@example.com",
    });
    mockPrisma.naturalRemedy.findMany.mockResolvedValue([]);
    mockPrisma.searchHistory.groupBy.mockResolvedValue([]);
    mockPrisma.searchHistory.count.mockResolvedValue(0);
    mockPrisma.favorite.count.mockResolvedValue(0);
    mockPrisma.healthProfile.findUnique.mockResolvedValue(null);
    mockPrisma.medicationCabinet.findMany.mockResolvedValue([]);
    mockPrisma.drugInteraction.findMany.mockResolvedValue([]);
    mockPrisma.remedyJournal.findMany.mockResolvedValue([]);
  });

  describe("fetchSharedDigestData", () => {
    it("should fetch new remedies and top searches", async () => {
      mockPrisma.naturalRemedy.findMany.mockResolvedValue([
        { id: "r1", name: "Turmeric", category: "Herbal" },
        { id: "r2", name: "Ginger", category: null },
      ]);
      mockPrisma.searchHistory.groupBy.mockResolvedValue([
        { query: "headache", _count: { query: 42 } },
        { query: "insomnia", _count: { query: 31 } },
      ]);

      const { fetchSharedDigestData } = await import("../email/digest-builder");

      const data = await fetchSharedDigestData();

      expect(data.newRemedies).toHaveLength(2);
      expect(data.newRemedies[0].name).toBe("Turmeric");
      expect(data.topSearches).toHaveLength(2);
      expect(data.topSearches[0].query).toBe("headache");
      expect(data.topSearches[0].count).toBe(42);
      expect(data.periodStart).toBeDefined();
      expect(data.periodEnd).toBeDefined();
      expect(data.weekAgo).toBeInstanceOf(Date);
    });

    it("should handle empty platform data", async () => {
      mockPrisma.naturalRemedy.findMany.mockResolvedValue([]);
      mockPrisma.searchHistory.groupBy.mockResolvedValue([]);

      const { fetchSharedDigestData } = await import("../email/digest-builder");

      const data = await fetchSharedDigestData();

      expect(data.newRemedies).toHaveLength(0);
      expect(data.topSearches).toHaveLength(0);
    });
  });

  describe("buildDigestData", () => {
    it("should return null when user is not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("nonexistent-user", "free");

      expect(result).toBeNull();
    });

    it("should build basic digest for free tier user", async () => {
      mockPrisma.favorite.count.mockResolvedValue(3);
      mockPrisma.searchHistory.count.mockResolvedValue(7);

      const sharedData = {
        newRemedies: [{ id: "r1", name: "Turmeric", category: "Herbal" }],
        topSearches: [{ query: "headache", count: 42 }],
        weekAgo,
        periodStart: "Mar 5",
        periodEnd: "Mar 12, 2026",
      };

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "free", sharedData);

      expect(result).not.toBeNull();
      expect(result!.name).toBe("TestUser");
      expect(result!.savedRemedies).toBe(3);
      expect(result!.searchCount).toBe(7);
      expect(result!.newRemedies).toHaveLength(1);
      expect(result!.newRemedies[0].name).toBe("Turmeric");
      expect(result!.topSearches).toHaveLength(1);
      // Free tier should NOT have personalized remedies or interaction alerts
      expect(result!.personalizedRemedies).toBeUndefined();
      expect(result!.interactionAlerts).toBeUndefined();
      expect(result!.journalSummary).toBeUndefined();
      expect(result!.aiInsight).toBeUndefined();
    });

    it("should use fallback name when user name is null", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        name: null,
        email: "test@example.com",
      });

      const sharedData = {
        newRemedies: [],
        topSearches: [],
        weekAgo,
        periodStart: "Mar 5",
        periodEnd: "Mar 12, 2026",
      };

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "free", sharedData);

      expect(result!.name).toBe("there");
    });

    it("should include personalized remedies for basic tier", async () => {
      mockPrisma.healthProfile.findUnique.mockResolvedValue({
        categories: ["Sleep", "Stress"],
        conditions: [],
      });
      mockPrisma.medicationCabinet.findMany.mockResolvedValue([]);
      mockPrisma.naturalRemedy.findMany.mockResolvedValue([
        { id: "r3", name: "Valerian", category: "Sleep" },
      ]);

      const sharedData = {
        newRemedies: [],
        topSearches: [],
        weekAgo,
        periodStart: "Mar 5",
        periodEnd: "Mar 12, 2026",
      };

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "basic", sharedData);

      expect(result!.personalizedRemedies).toBeDefined();
      expect(result!.personalizedRemedies).toHaveLength(1);
      expect(result!.personalizedRemedies![0].name).toBe("Valerian");
      expect(result!.personalizedRemedies![0].matchReason).toContain("Sleep");
    });

    it("should include interaction alerts for basic tier with medications", async () => {
      mockPrisma.healthProfile.findUnique.mockResolvedValue(null);
      mockPrisma.medicationCabinet.findMany.mockResolvedValue([
        { name: "Aspirin" },
        { name: "Lisinopril" },
      ]);
      mockPrisma.drugInteraction.findMany.mockResolvedValue([
        {
          substanceA: "Aspirin",
          substanceB: "Ginkgo Biloba",
          severity: "moderate",
          description: "May increase bleeding risk",
        },
      ]);

      const sharedData = {
        newRemedies: [],
        topSearches: [],
        weekAgo,
        periodStart: "Mar 5",
        periodEnd: "Mar 12, 2026",
      };

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "basic", sharedData);

      expect(result!.interactionAlerts).toBeDefined();
      expect(result!.interactionAlerts).toHaveLength(1);
      expect(result!.interactionAlerts![0].medication).toBe("Aspirin");
      expect(result!.interactionAlerts![0].substance).toBe("Ginkgo Biloba");
    });

    it("should skip personalized remedies when profile has no categories", async () => {
      mockPrisma.healthProfile.findUnique.mockResolvedValue({
        categories: [],
        conditions: [],
      });
      mockPrisma.medicationCabinet.findMany.mockResolvedValue([]);

      const sharedData = {
        newRemedies: [],
        topSearches: [],
        weekAgo,
        periodStart: "Mar 5",
        periodEnd: "Mar 12, 2026",
      };

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "basic", sharedData);

      expect(result!.personalizedRemedies).toBeUndefined();
    });

    it("should include journal summary for premium tier", async () => {
      mockPrisma.healthProfile.findUnique.mockResolvedValue(null);
      mockPrisma.medicationCabinet.findMany.mockResolvedValue([]);
      mockPrisma.remedyJournal.findMany.mockResolvedValue([
        { rating: 4, remedyName: "Chamomile" },
        { rating: 5, remedyName: "Chamomile" },
        { rating: 3, remedyName: "Lavender" },
      ]);

      // Mock the AI client import to return null (no OpenAI configured)
      vi.doMock("@/lib/ai/client", () => ({
        getOpenAIClient: vi.fn(() => null),
      }));

      const sharedData = {
        newRemedies: [],
        topSearches: [],
        weekAgo,
        periodStart: "Mar 5",
        periodEnd: "Mar 12, 2026",
      };

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "premium", sharedData);

      expect(result!.journalSummary).toBeDefined();
      expect(result!.journalSummary!.entriesThisWeek).toBe(3);
      expect(result!.journalSummary!.avgRating).toBe(4);
      expect(result!.journalSummary!.topRemedy).toBe("Chamomile");
    });

    it("should handle users with no journal entries for premium tier", async () => {
      mockPrisma.healthProfile.findUnique.mockResolvedValue(null);
      mockPrisma.medicationCabinet.findMany.mockResolvedValue([]);
      mockPrisma.remedyJournal.findMany.mockResolvedValue([]);

      vi.doMock("@/lib/ai/client", () => ({
        getOpenAIClient: vi.fn(() => null),
      }));

      const sharedData = {
        newRemedies: [],
        topSearches: [],
        weekAgo,
        periodStart: "Mar 5",
        periodEnd: "Mar 12, 2026",
      };

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "premium", sharedData);

      expect(result!.journalSummary).toBeUndefined();
    });

    it("should return null when an unexpected error occurs", async () => {
      mockPrisma.user.findUnique.mockRejectedValue(
        new Error("DB connection lost"),
      );

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "free");

      expect(result).toBeNull();
    });

    it("should fetch shared data inline when not provided", async () => {
      mockPrisma.naturalRemedy.findMany.mockResolvedValue([]);
      mockPrisma.searchHistory.groupBy.mockResolvedValue([]);

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "free");

      expect(result).not.toBeNull();
      // Should have called naturalRemedy.findMany for shared data
      expect(mockPrisma.naturalRemedy.findMany).toHaveBeenCalled();
      expect(mockPrisma.searchHistory.groupBy).toHaveBeenCalled();
    });

    it('should use "General" as fallback category for remedies with null category', async () => {
      const sharedData = {
        newRemedies: [{ id: "r1", name: "NoCategory", category: null }],
        topSearches: [],
        weekAgo,
        periodStart: "Mar 5",
        periodEnd: "Mar 12, 2026",
      };

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "free", sharedData);

      expect(result!.newRemedies[0].category).toBe("General");
    });

    it("should format remedy URLs correctly", async () => {
      const sharedData = {
        newRemedies: [{ id: "rem-abc", name: "Test", category: "Herbal" }],
        topSearches: [],
        weekAgo,
        periodStart: "Mar 5",
        periodEnd: "Mar 12, 2026",
      };

      const { buildDigestData } = await import("../email/digest-builder");

      const result = await buildDigestData("user-1", "free", sharedData);

      expect(result!.newRemedies[0].url).toContain("/remedy/rem-abc");
    });
  });
});
