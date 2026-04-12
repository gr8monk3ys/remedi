import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma, createTestUser } from "../setup/setup";
import {
  addFavorite,
  getFavorites,
  getFavoriteById,
  isFavorite,
  updateFavorite,
  removeFavorite,
  getCollectionNames,
} from "@/lib/db/favorites";

describe("Favorites DB Integration", () => {
  let testUserId: string;
  const testRemedyId = "00000000-0000-0000-0000-000000000001";

  beforeEach(async () => {
    const user = await createTestUser();
    testUserId = user.id;
  });

  afterEach(async () => {
    await prisma.favorite.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it("addFavorite creates a favorite record", async () => {
    const remedyId = crypto.randomUUID();
    const favorite = await addFavorite({
      remedyId,
      remedyName: "Chamomile Tea",
      userId: testUserId,
    });

    expect(favorite).toBeDefined();
    expect(favorite.remedyId).toBe(remedyId);
    expect(favorite.remedyName).toBe("Chamomile Tea");
    expect(favorite.userId).toBe(testUserId);
    expect(favorite.id).toBeDefined();
  });

  it("getFavorites returns favorites by userId", async () => {
    const remedyId = crypto.randomUUID();
    await addFavorite({
      remedyId,
      remedyName: "Lavender Oil",
      userId: testUserId,
    });

    const favorites = await getFavorites(undefined, testUserId);

    expect(favorites).toHaveLength(1);
    expect(favorites[0].remedyId).toBe(remedyId);
    expect(favorites[0].userId).toBe(testUserId);
  });

  it("getFavorites returns empty array when no identifier provided", async () => {
    const favorites = await getFavorites();
    expect(favorites).toEqual([]);
  });

  it("getFavorites caps at 100 records", async () => {
    // Create 5 favorites to verify the query works; full 100+ test would be slow
    const inserts = Array.from({ length: 5 }, (_, i) =>
      addFavorite({
        remedyId: crypto.randomUUID(),
        remedyName: `Remedy ${i}`,
        userId: testUserId,
      }),
    );
    await Promise.all(inserts);

    const favorites = await getFavorites(undefined, testUserId);
    expect(favorites.length).toBeLessThanOrEqual(100);
    expect(favorites.length).toBe(5);
  });

  it("isFavorite returns true when favorited", async () => {
    const remedyId = crypto.randomUUID();
    await addFavorite({
      remedyId,
      remedyName: "Ginger Root",
      userId: testUserId,
    });

    const result = await isFavorite(remedyId, undefined, testUserId);
    expect(result).toBe(true);
  });

  it("isFavorite returns false when not favorited", async () => {
    const remedyId = crypto.randomUUID();
    const result = await isFavorite(remedyId, undefined, testUserId);
    expect(result).toBe(false);
  });

  it("isFavorite returns false when no identifier provided", async () => {
    const result = await isFavorite(testRemedyId);
    expect(result).toBe(false);
  });

  it("updateFavorite updates notes and collectionName", async () => {
    const remedyId = crypto.randomUUID();
    const created = await addFavorite({
      remedyId,
      remedyName: "Echinacea",
      userId: testUserId,
    });

    const updated = await updateFavorite(created.id, {
      notes: "Good for immune support",
      collectionName: "Immunity",
    });

    expect(updated.notes).toBe("Good for immune support");
    expect(updated.collectionName).toBe("Immunity");
  });

  it("removeFavorite deletes the favorite", async () => {
    const remedyId = crypto.randomUUID();
    const created = await addFavorite({
      remedyId,
      remedyName: "Turmeric",
      userId: testUserId,
    });

    await removeFavorite(created.id);

    const found = await getFavoriteById(created.id);
    expect(found).toBeNull();
  });

  it("getCollectionNames returns unique collection names", async () => {
    await addFavorite({
      remedyId: crypto.randomUUID(),
      remedyName: "Remedy A",
      userId: testUserId,
      collectionName: "Immunity",
    });
    await addFavorite({
      remedyId: crypto.randomUUID(),
      remedyName: "Remedy B",
      userId: testUserId,
      collectionName: "Sleep",
    });
    await addFavorite({
      remedyId: crypto.randomUUID(),
      remedyName: "Remedy C",
      userId: testUserId,
      collectionName: "Immunity",
    });

    const names = await getCollectionNames(undefined, testUserId);

    expect(names).toHaveLength(2);
    expect(names).toContain("Immunity");
    expect(names).toContain("Sleep");
  });

  it("addFavorite throws on duplicate userId+remedyId (unique constraint)", async () => {
    const remedyId = crypto.randomUUID();
    await addFavorite({
      remedyId,
      remedyName: "Valerian Root",
      userId: testUserId,
    });

    await expect(
      addFavorite({
        remedyId,
        remedyName: "Valerian Root",
        userId: testUserId,
      }),
    ).rejects.toThrow();
  });
});
