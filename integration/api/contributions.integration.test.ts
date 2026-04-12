import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma, createTestUser } from "../setup/setup";
import type { User } from "@prisma/client";

// Mock @/lib/auth BEFORE importing the route handler
vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
  isAdmin: vi.fn().mockResolvedValue(false),
  isModerator: vi.fn().mockResolvedValue(false),
}));

import { POST, GET } from "@/app/api/contributions/route";
import { getCurrentUser } from "@/lib/auth";

describe("POST /api/contributions (integration)", () => {
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
    await prisma.remedyContribution.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.user.deleteMany({ where: { id: testUser.id } });
  });

  const validBody = {
    name: "Test Herbal Remedy",
    description:
      "A detailed description of this herbal remedy that is at least 20 characters long.",
    category: "Herbal",
    ingredients: ["chamomile", "lavender"],
    benefits: ["relaxation", "improved sleep"],
  };

  function makeRequest(body: unknown) {
    return new NextRequest("http://localhost:3000/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("creates a pending contribution when authenticated with valid data", async () => {
    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("pending");
    expect(json.data.userId).toBe(testUser.id);
    expect(json.data.name).toBe(validBody.name);

    // Verify persisted in DB
    const dbRecord = await prisma.remedyContribution.findUnique({
      where: { id: json.data.id },
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.status).toBe("pending");
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 when description is too short (validation error)", async () => {
    const req = makeRequest({ ...validBody, description: "too short" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when name is too short", async () => {
    const req = makeRequest({ ...validBody, name: "X" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("returns 400 when ingredients array is empty", async () => {
    const req = makeRequest({ ...validBody, ingredients: [] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("returns 400 when benefits array is empty", async () => {
    const req = makeRequest({ ...validBody, benefits: [] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("returns 400 when category is missing", async () => {
    const { category: _omitted, ...bodyWithoutCategory } = validBody;
    const req = makeRequest(bodyWithoutCategory);
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("processes references correctly (title + url format)", async () => {
    const withRefs = {
      ...validBody,
      references: [
        { title: "PubMed Study", url: "https://pubmed.ncbi.nlm.nih.gov/123" },
      ],
    };
    const req = makeRequest(withRefs);
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.references).toContain(
      "PubMed Study (https://pubmed.ncbi.nlm.nih.gov/123)",
    );
  });

  it("processes references with title-only (no url)", async () => {
    const withRefs = {
      ...validBody,
      references: [{ title: "Journal of Herbal Medicine" }],
    };
    const req = makeRequest(withRefs);
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.references).toContain("Journal of Herbal Medicine");
  });

  it("stores optional fields (usage, dosage, precautions) when provided", async () => {
    const withOptionals = {
      ...validBody,
      usage: "Brew as a tea and drink before bedtime.",
      dosage: "One cup per evening, max 2 cups per day.",
      precautions: "Do not use during pregnancy.",
    };
    const req = makeRequest(withOptionals);
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.usage).toBe(withOptionals.usage);
    expect(json.data.dosage).toBe(withOptionals.dosage);
    expect(json.data.precautions).toBe(withOptionals.precautions);

    // Verify in DB
    const dbRecord = await prisma.remedyContribution.findUnique({
      where: { id: json.data.id },
    });
    expect(dbRecord?.usage).toBe(withOptionals.usage);
    expect(dbRecord?.dosage).toBe(withOptionals.dosage);
    expect(dbRecord?.precautions).toBe(withOptionals.precautions);
  });

  it("sets userId to the authenticated user's ID", async () => {
    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    const dbRecord = await prisma.remedyContribution.findUnique({
      where: { id: json.data.id },
    });
    expect(dbRecord?.userId).toBe(testUser.id);
  });
});

describe("GET /api/contributions (integration)", () => {
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
    await prisma.remedyContribution.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.user.deleteMany({ where: { id: testUser.id } });
  });

  async function seedContribution(
    overrides: Partial<{
      name: string;
      status: "pending" | "approved" | "rejected";
    }> = {},
  ) {
    return prisma.remedyContribution.create({
      data: {
        userId: testUser.id,
        name: overrides.name ?? `Remedy-${Date.now()}`,
        description: "A detailed remedy description for testing purposes here.",
        category: "Herbal",
        ingredients: ["herb-a"],
        benefits: ["benefit-a"],
        references: [],
        status: overrides.status ?? "pending",
      },
    });
  }

  function makeGetRequest(params: Record<string, string> = {}) {
    const url = new URL("http://localhost:3000/api/contributions");
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return new NextRequest(url.toString());
  }

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const req = makeGetRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("returns empty list when user has no contributions", async () => {
    const req = makeGetRequest();
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.contributions).toHaveLength(0);
    expect(json.data.total).toBe(0);
  });

  it("returns only the authenticated user's contributions", async () => {
    // Create another user whose contributions should NOT appear
    const otherUser = await createTestUser({
      email: `other-${Date.now()}@test.com`,
    });
    await prisma.remedyContribution.create({
      data: {
        userId: otherUser.id,
        name: "Other user remedy",
        description: "This belongs to another user entirely.",
        category: "Herbal",
        ingredients: ["something"],
        benefits: ["benefit"],
        references: [],
        status: "pending",
      },
    });

    await seedContribution({ name: "My Remedy" });

    const req = makeGetRequest();
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.contributions).toHaveLength(1);
    expect(json.data.contributions[0].name).toBe("My Remedy");

    // Cleanup other user
    await prisma.remedyContribution.deleteMany({
      where: { userId: otherUser.id },
    });
    await prisma.user.deleteMany({ where: { id: otherUser.id } });
  });

  it("returns multiple contributions with correct pagination metadata", async () => {
    await seedContribution({ name: "Remedy One" });
    await seedContribution({ name: "Remedy Two" });
    await seedContribution({ name: "Remedy Three" });

    const req = makeGetRequest();
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.total).toBe(3);
    expect(json.data.contributions).toHaveLength(3);
    expect(json.data.page).toBe(1);
    expect(json.data.totalPages).toBe(1);
  });

  it("filters contributions by status=pending", async () => {
    await seedContribution({ name: "Pending One", status: "pending" });
    await seedContribution({ name: "Approved One", status: "approved" });
    await seedContribution({ name: "Rejected One", status: "rejected" });

    const req = makeGetRequest({ status: "pending" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.total).toBe(1);
    expect(json.data.contributions[0].status).toBe("pending");
    expect(json.data.contributions[0].name).toBe("Pending One");
  });

  it("filters contributions by status=approved", async () => {
    await seedContribution({ name: "Pending Two", status: "pending" });
    await seedContribution({ name: "Approved Two", status: "approved" });

    const req = makeGetRequest({ status: "approved" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.total).toBe(1);
    expect(json.data.contributions[0].status).toBe("approved");
  });

  it("supports pagination with page and limit params", async () => {
    await seedContribution({ name: "Page Remedy 1" });
    await seedContribution({ name: "Page Remedy 2" });
    await seedContribution({ name: "Page Remedy 3" });

    const req = makeGetRequest({ page: "1", limit: "2" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.contributions).toHaveLength(2);
    expect(json.data.total).toBe(3);
    expect(json.data.totalPages).toBe(2);
    expect(json.data.page).toBe(1);
  });
});
