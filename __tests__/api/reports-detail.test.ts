/**
 * Tests for /api/reports/[id] route
 *
 * Tests secure fetch/delete behavior for report ownership.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockGetReportById = vi.fn();
const mockDeleteReport = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

vi.mock("@/lib/db", () => ({
  getReportById: (...args: unknown[]) => mockGetReportById(...args),
  deleteReport: (...args: unknown[]) => mockDeleteReport(...args),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

import { DELETE, GET } from "@/app/api/reports/[id]/route";

const authenticatedUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

function params(id: string): Promise<{ id: string }> {
  return Promise.resolve({ id });
}

describe("/api/reports/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
  });

  describe("GET /api/reports/[id]", () => {
    it("should return 401 when unauthenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const response = await GET(new Request("http://localhost:3000"), {
        params: params("report-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 404 when report does not exist", async () => {
      mockGetReportById.mockResolvedValue(null);

      const response = await GET(new Request("http://localhost:3000"), {
        params: params("report-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return 404 when report belongs to another user", async () => {
      mockGetReportById.mockResolvedValue({
        id: "report-1",
        userId: "user-other",
      });

      const response = await GET(new Request("http://localhost:3000"), {
        params: params("report-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should return report details for the owner", async () => {
      const report = {
        id: "report-1",
        userId: "user-123",
        title: "Sleep report",
        status: "complete",
      };
      mockGetReportById.mockResolvedValue(report);

      const response = await GET(new Request("http://localhost:3000"), {
        params: params("report-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.report).toEqual(report);
    });

    it("should return 500 on read failure", async () => {
      mockGetReportById.mockRejectedValue(new Error("DB failure"));

      const response = await GET(new Request("http://localhost:3000"), {
        params: params("report-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("DELETE /api/reports/[id]", () => {
    it("should return 401 when unauthenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const response = await DELETE(new Request("http://localhost:3000"), {
        params: params("report-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 404 when report is missing", async () => {
      mockGetReportById.mockResolvedValue(null);

      const response = await DELETE(new Request("http://localhost:3000"), {
        params: params("report-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should delete report for owner", async () => {
      mockGetReportById.mockResolvedValue({
        id: "report-1",
        userId: "user-123",
      });
      mockDeleteReport.mockResolvedValue(undefined);

      const response = await DELETE(new Request("http://localhost:3000"), {
        params: params("report-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe("Report deleted");
      expect(mockDeleteReport).toHaveBeenCalledWith("report-1");
    });

    it("should return 500 on delete failure", async () => {
      mockGetReportById.mockResolvedValue({
        id: "report-1",
        userId: "user-123",
      });
      mockDeleteReport.mockRejectedValue(new Error("DB failure"));

      const response = await DELETE(new Request("http://localhost:3000"), {
        params: params("report-1"),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
