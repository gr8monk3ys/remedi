/**
 * Tests for /api/reports route
 *
 * Tests report operations:
 * - GET: List user's reports (paginated)
 * - POST: Generate a new report (plan limits, validation)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockGetUserReports = vi.fn();
const mockCreateReport = vi.fn();
const mockUpdateReportContent = vi.fn();
const mockCountMonthlyReports = vi.fn();
const mockGenerateRemedyReport = vi.fn();
const mockPrismaSubscriptionFindUnique = vi.fn();
const mockGetTrialStatus = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/trial", () => ({
  getTrialStatus: (...args: unknown[]) => mockGetTrialStatus(...args),
}));

vi.mock("@/lib/db", () => ({
  getUserReports: (...args: unknown[]) => mockGetUserReports(...args),
  createReport: (...args: unknown[]) => mockCreateReport(...args),
  updateReportContent: (...args: unknown[]) => mockUpdateReportContent(...args),
  countMonthlyReports: (...args: unknown[]) => mockCountMonthlyReports(...args),
  prisma: {
    subscription: {
      findUnique: (...args: unknown[]) =>
        mockPrismaSubscriptionFindUnique(...args),
    },
  },
}));

vi.mock("@/lib/ai/report-generator", () => ({
  generateRemedyReport: (...args: unknown[]) =>
    mockGenerateRemedyReport(...args),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

const authenticatedUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

const mockReport = {
  id: "report-1",
  userId: "user-123",
  title: "My Health Report",
  queryType: "condition",
  queryInput: "headache",
  status: "pending",
  createdAt: new Date("2024-06-15"),
  updatedAt: new Date("2024-06-15"),
};

describe("/api/reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockGetTrialStatus.mockResolvedValue({
      isActive: false,
      isEligible: true,
      hasUsedTrial: false,
      startDate: null,
      endDate: null,
      daysRemaining: 0,
      plan: "basic",
    });
    // Default: user has basic plan
    mockPrismaSubscriptionFindUnique.mockResolvedValue({
      plan: "basic",
      status: "active",
    });
    mockGenerateRemedyReport.mockResolvedValue({ content: "Report content" });
  });

  describe("GET /api/reports", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { GET } = await import("@/app/api/reports/route");
      const request = new NextRequest("http://localhost:3000/api/reports");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return paginated reports", async () => {
      const mockResult = {
        reports: [mockReport],
        total: 1,
        page: 1,
        pageSize: 10,
      };
      mockGetUserReports.mockResolvedValue(mockResult);
      const { GET } = await import("@/app/api/reports/route");
      const request = new NextRequest("http://localhost:3000/api/reports");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockGetUserReports).toHaveBeenCalledWith("user-123", 1, 10);
    });

    it("should accept page and pageSize parameters", async () => {
      const mockResult = {
        reports: [],
        total: 0,
        page: 2,
        pageSize: 5,
      };
      mockGetUserReports.mockResolvedValue(mockResult);
      const { GET } = await import("@/app/api/reports/route");
      const request = new NextRequest(
        "http://localhost:3000/api/reports?page=2&pageSize=5",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetUserReports).toHaveBeenCalledWith("user-123", 2, 5);
    });

    it("should return 500 on server error", async () => {
      mockGetUserReports.mockRejectedValue(new Error("Database error"));
      const { GET } = await import("@/app/api/reports/route");
      const request = new NextRequest("http://localhost:3000/api/reports");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/reports", () => {
    const validBody = {
      title: "My Health Report",
      queryType: "condition",
      queryInput: "headache",
      includeCabinetInteractions: true,
      includeJournalData: false,
    };

    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { POST } = await import("@/app/api/reports/route");
      const request = new Request("http://localhost:3000/api/reports", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 403 when user exceeds monthly report limit", async () => {
      mockCountMonthlyReports.mockResolvedValue(2); // Basic plan allows 2
      const { POST } = await import("@/app/api/reports/route");
      const request = new Request("http://localhost:3000/api/reports", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FORBIDDEN");
    });

    it("should return 403 when free user tries to generate report", async () => {
      mockGetTrialStatus.mockResolvedValue({
        isActive: false,
        isEligible: true,
        hasUsedTrial: false,
        startDate: null,
        endDate: null,
        daysRemaining: 0,
        plan: "free",
      });
      mockCountMonthlyReports.mockResolvedValue(0);
      const { POST } = await import("@/app/api/reports/route");
      const request = new Request("http://localhost:3000/api/reports", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FORBIDDEN");
    });

    it("should create a report successfully", async () => {
      mockCountMonthlyReports.mockResolvedValue(0);
      mockCreateReport.mockResolvedValue(mockReport);
      const { POST } = await import("@/app/api/reports/route");
      const request = new Request("http://localhost:3000/api/reports", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("Report generation started");
      expect(mockCreateReport).toHaveBeenCalledWith("user-123", {
        title: validBody.title,
        queryType: validBody.queryType,
        queryInput: validBody.queryInput,
      });
    });

    it("should return 400 for invalid input", async () => {
      mockCountMonthlyReports.mockResolvedValue(0);
      const { POST } = await import("@/app/api/reports/route");
      const request = new Request("http://localhost:3000/api/reports", {
        method: "POST",
        body: JSON.stringify({ title: "" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return 400 for invalid queryType", async () => {
      mockCountMonthlyReports.mockResolvedValue(0);
      const { POST } = await import("@/app/api/reports/route");
      const request = new Request("http://localhost:3000/api/reports", {
        method: "POST",
        body: JSON.stringify({
          ...validBody,
          queryType: "invalid_type",
        }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return 500 on server error", async () => {
      mockCountMonthlyReports.mockResolvedValue(0);
      mockCreateReport.mockRejectedValue(new Error("Database error"));
      const { POST } = await import("@/app/api/reports/route");
      const request = new Request("http://localhost:3000/api/reports", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
