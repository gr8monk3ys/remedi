import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma, createTestUser } from "../setup/setup";
import type { User, RemedyContribution } from "@prisma/client";

// Mock @/lib/auth BEFORE importing the route handler
vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
  isAdmin: vi.fn(),
  isModerator: vi.fn(),
}));

import { PATCH } from "@/app/api/admin/moderation/[id]/route";
import { getCurrentUser, isAdmin, isModerator } from "@/lib/auth";

describe("PATCH /api/admin/moderation/[id] (integration)", () => {
  let adminUser: User;
  let contributorUser: User;
  let contribution: RemedyContribution;

  beforeEach(async () => {
    adminUser = await createTestUser({
      role: "admin",
      email: `admin-${Date.now()}@test.com`,
    });
    contributorUser = await createTestUser({
      email: `contributor-${Date.now()}@test.com`,
    });

    vi.mocked(getCurrentUser).mockResolvedValue({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      image: null,
      role: "admin",
    });
    vi.mocked(isAdmin).mockResolvedValue(true);
    vi.mocked(isModerator).mockResolvedValue(true);

    contribution = await prisma.remedyContribution.create({
      data: {
        userId: contributorUser.id,
        name: `Test Remedy ${Date.now()}`,
        description:
          "A detailed test remedy description for moderation testing.",
        category: "Herbal",
        ingredients: ["herb-a", "herb-b"],
        benefits: ["benefit-a", "benefit-b"],
        references: [],
        status: "pending",
      },
    });
  });

  afterEach(async () => {
    // Clean up in dependency order: NaturalRemedy created on approval, then contributions, then users
    await prisma.naturalRemedy.deleteMany({
      where: { name: contribution.name },
    });
    await prisma.remedyContribution.deleteMany({
      where: { id: contribution.id },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, contributorUser.id] } },
    });
  });

  function makePatchRequest(id: string, body: unknown) {
    return new NextRequest(`http://localhost:3000/api/admin/moderation/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  describe("contribution approval", () => {
    it("creates a NaturalRemedy and marks contribution as approved", async () => {
      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "approve",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      // Contribution should be approved
      const updatedContrib = await prisma.remedyContribution.findUnique({
        where: { id: contribution.id },
      });
      expect(updatedContrib?.status).toBe("approved");
      expect(updatedContrib?.moderatedBy).toBe(adminUser.id);
      expect(updatedContrib?.moderatedAt).not.toBeNull();

      // NaturalRemedy should be created from contribution data
      const remedy = await prisma.naturalRemedy.findFirst({
        where: { name: contribution.name },
      });
      expect(remedy).not.toBeNull();
      expect(remedy?.evidenceLevel).toBe("Traditional");
      expect(remedy?.category).toBe(contribution.category);
      expect(remedy?.ingredients).toEqual(contribution.ingredients);
      expect(remedy?.benefits).toEqual(contribution.benefits);
    });

    it("stores optional moderator note on approval", async () => {
      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "approve",
        note: "Excellent research backing this remedy.",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(200);

      const updatedContrib = await prisma.remedyContribution.findUnique({
        where: { id: contribution.id },
      });
      expect(updatedContrib?.moderatorNote).toBe(
        "Excellent research backing this remedy.",
      );
    });

    it("returns 409 when approving an already-approved contribution (idempotency)", async () => {
      // Pre-mark as approved
      await prisma.remedyContribution.update({
        where: { id: contribution.id },
        data: { status: "approved" },
      });

      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "approve",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("returns 409 when approving an already-rejected contribution (idempotency)", async () => {
      await prisma.remedyContribution.update({
        where: { id: contribution.id },
        data: { status: "rejected" },
      });

      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "approve",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(409);
    });

    it("returns 404 for non-existent contribution ID on approve", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const req = makePatchRequest(fakeId, {
        type: "contribution",
        action: "approve",
      });
      const res = await PATCH(req, { params: Promise.resolve({ id: fakeId }) });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe("contribution rejection", () => {
    it("marks contribution as rejected without creating a NaturalRemedy", async () => {
      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "reject",
        note: "Not supported by sufficient evidence",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const updatedContrib = await prisma.remedyContribution.findUnique({
        where: { id: contribution.id },
      });
      expect(updatedContrib?.status).toBe("rejected");
      expect(updatedContrib?.moderatorNote).toBe(
        "Not supported by sufficient evidence",
      );
      expect(updatedContrib?.moderatedBy).toBe(adminUser.id);
      expect(updatedContrib?.moderatedAt).not.toBeNull();

      // No NaturalRemedy should be created
      const remedy = await prisma.naturalRemedy.findFirst({
        where: { name: contribution.name },
      });
      expect(remedy).toBeNull();
    });

    it("rejects without a note (note is optional)", async () => {
      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "reject",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(200);

      const updatedContrib = await prisma.remedyContribution.findUnique({
        where: { id: contribution.id },
      });
      expect(updatedContrib?.status).toBe("rejected");
      expect(updatedContrib?.moderatorNote).toBeNull();
    });

    it("returns 409 when rejecting an already-rejected contribution (idempotency)", async () => {
      await prisma.remedyContribution.update({
        where: { id: contribution.id },
        data: { status: "rejected" },
      });

      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "reject",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(409);
    });

    it("returns 404 for non-existent contribution ID on reject", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000001";
      const req = makePatchRequest(fakeId, {
        type: "contribution",
        action: "reject",
      });
      const res = await PATCH(req, { params: Promise.resolve({ id: fakeId }) });
      expect(res.status).toBe(404);
    });
  });

  describe("authorization", () => {
    it("returns 403 for a regular (non-admin, non-moderator) user", async () => {
      vi.mocked(isAdmin).mockResolvedValue(false);
      vi.mocked(isModerator).mockResolvedValue(false);
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: contributorUser.id,
        email: contributorUser.email,
        name: null,
        image: null,
        role: "user",
      });

      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "approve",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("returns 403 when not authenticated (no current user)", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);
      vi.mocked(isAdmin).mockResolvedValue(false);
      vi.mocked(isModerator).mockResolvedValue(false);

      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "approve",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(403);
    });

    it("allows a moderator (non-admin) to approve contributions", async () => {
      vi.mocked(isAdmin).mockResolvedValue(false);
      vi.mocked(isModerator).mockResolvedValue(true);

      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "approve",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe("input validation", () => {
    it("returns 400 for invalid action value", async () => {
      const req = makePatchRequest(contribution.id, {
        type: "contribution",
        action: "delete", // invalid
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid type value", async () => {
      const req = makePatchRequest(contribution.id, {
        type: "something_else", // invalid
        action: "approve",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 when body is missing required fields", async () => {
      const req = makePatchRequest(contribution.id, {});
      const res = await PATCH(req, {
        params: Promise.resolve({ id: contribution.id }),
      });
      expect(res.status).toBe(400);
    });
  });
});
