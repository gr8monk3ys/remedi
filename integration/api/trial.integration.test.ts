import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma, createTestUser } from "../setup/setup";
import type { User } from "@prisma/client";

// Mock @/lib/auth BEFORE importing the route handlers
vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
  isAdmin: vi.fn().mockResolvedValue(false),
  isModerator: vi.fn().mockResolvedValue(false),
}));

import { POST } from "@/app/api/trial/start/route";
import { GET } from "@/app/api/trial/check/route";
import { getCurrentUser } from "@/lib/auth";

describe("Trial API Integration", () => {
  let testUser: User;

  beforeEach(async () => {
    testUser = await createTestUser();
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
      image: null,
      role: "user",
    });
  });

  afterEach(async () => {
    await prisma.subscription.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.deleteMany({ where: { id: testUser.id } });
  });

  describe("POST /api/trial/start", () => {
    it("starts a trial for an eligible user and returns correct shape", async () => {
      const req = new NextRequest("http://localhost:3000/api/trial/start", {
        method: "POST",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.message).toBeDefined();
      expect(json.data.daysRemaining).toBe(7);
      expect(json.data.plan).toBe("premium");
      expect(json.data.features).toBeInstanceOf(Array);
      expect(json.data.features.length).toBeGreaterThan(0);
      expect(json.data.trialEndDate).toBeDefined();
    });

    it("sets hasUsedTrial=true and populates trialEndDate in DB after starting", async () => {
      const req = new NextRequest("http://localhost:3000/api/trial/start", {
        method: "POST",
      });
      await POST(req);

      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser?.hasUsedTrial).toBe(true);
      expect(updatedUser?.trialStartDate).not.toBeNull();
      expect(updatedUser?.trialEndDate).not.toBeNull();

      // trialEndDate should be approximately 7 days from now
      const now = new Date();
      const endDate = updatedUser?.trialEndDate as Date;
      const diffMs = endDate.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(6);
      expect(diffDays).toBeLessThanOrEqual(8);
    });

    it("creates a subscription with status=trialing and plan=premium in DB", async () => {
      const req = new NextRequest("http://localhost:3000/api/trial/start", {
        method: "POST",
      });
      await POST(req);

      const subscription = await prisma.subscription.findUnique({
        where: { userId: testUser.id },
      });
      expect(subscription).not.toBeNull();
      expect(subscription?.status).toBe("trialing");
      expect(subscription?.plan).toBe("premium");
    });

    it("returns 400 with TRIAL_NOT_ELIGIBLE when user already used trial", async () => {
      // Pre-mark the user as having used the trial
      await prisma.user.update({
        where: { id: testUser.id },
        data: { hasUsedTrial: true },
      });

      const req = new NextRequest("http://localhost:3000/api/trial/start", {
        method: "POST",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("TRIAL_NOT_ELIGIBLE");
    });

    it("returns 400 if trial is called a second time on the same user", async () => {
      const req1 = new NextRequest("http://localhost:3000/api/trial/start", {
        method: "POST",
      });
      const res1 = await POST(req1);
      expect(res1.status).toBe(200);

      const req2 = new NextRequest("http://localhost:3000/api/trial/start", {
        method: "POST",
      });
      const res2 = await POST(req2);
      expect(res2.status).toBe(400);
      const json2 = await res2.json();
      expect(json2.error.code).toBe("TRIAL_NOT_ELIGIBLE");
    });

    it("returns 401 when not authenticated", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/trial/start", {
        method: "POST",
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /api/trial/check", () => {
    it("returns eligible status for a brand-new user (no trial history)", async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.isEligible).toBe(true);
      expect(json.data.hasUsedTrial).toBe(false);
      expect(json.data.isActive).toBe(false);
      expect(json.data.startDate).toBeNull();
      expect(json.data.endDate).toBeNull();
      expect(json.data.daysRemaining).toBe(0);
    });

    it("includes trialConfig in the response", async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.trialConfig).toBeDefined();
      expect(json.data.trialConfig.durationDays).toBe(7);
      expect(json.data.trialConfig.plan).toBe("premium");
      expect(json.data.trialConfig.features).toBeInstanceOf(Array);
    });

    it("returns not eligible and isActive=true after starting trial", async () => {
      // Start the trial first
      const startReq = new NextRequest(
        "http://localhost:3000/api/trial/start",
        { method: "POST" },
      );
      await POST(startReq);

      // Now check status
      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.isEligible).toBe(false);
      expect(json.data.hasUsedTrial).toBe(true);
      expect(json.data.isActive).toBe(true);
      expect(json.data.daysRemaining).toBeGreaterThan(0);
      expect(json.data.daysRemaining).toBeLessThanOrEqual(7);
      expect(json.data.endDate).not.toBeNull();
      expect(json.data.startDate).not.toBeNull();
    });

    it("returns not eligible when user has hasUsedTrial=true but no active subscription", async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { hasUsedTrial: true },
      });

      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.isEligible).toBe(false);
      expect(json.data.hasUsedTrial).toBe(true);
      expect(json.data.isActive).toBe(false);
    });

    it("returns 401 when not authenticated", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });
  });
});
