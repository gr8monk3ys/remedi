import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma, createTestUser } from "../setup/setup";
import {
  saveSearchHistory,
  getSearchHistory,
  getPopularSearches,
  clearSearchHistory,
} from "@/lib/db/search-history";

describe("Search History DB Integration", () => {
  let testUserId: string;
  const sessionId = `test-session-${Date.now()}`;

  beforeEach(async () => {
    const user = await createTestUser();
    testUserId = user.id;
  });

  afterEach(async () => {
    await prisma.searchHistory.deleteMany({
      where: { OR: [{ userId: testUserId }, { sessionId }] },
    });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it("saveSearchHistory creates a record with userId", async () => {
    await saveSearchHistory("ibuprofen", 5, undefined, testUserId);

    const history = await getSearchHistory(undefined, testUserId);
    expect(history).toHaveLength(1);
    expect(history[0].query).toBe("ibuprofen");
    expect(history[0].resultsCount).toBe(5);
  });

  it("saveSearchHistory creates a record with sessionId only", async () => {
    await saveSearchHistory("aspirin", 3, sessionId);

    const history = await getSearchHistory(sessionId);
    expect(history).toHaveLength(1);
    expect(history[0].query).toBe("aspirin");
    expect(history[0].resultsCount).toBe(3);
  });

  it("getSearchHistory returns records by userId", async () => {
    await saveSearchHistory("melatonin", 2, undefined, testUserId);
    await saveSearchHistory("vitamin-c", 7, undefined, testUserId);

    const history = await getSearchHistory(undefined, testUserId);
    expect(history.length).toBe(2);
    const queries = history.map((h) => h.query);
    expect(queries).toContain("melatonin");
    expect(queries).toContain("vitamin-c");
  });

  it("getSearchHistory returns records by sessionId", async () => {
    await saveSearchHistory("turmeric", 4, sessionId);

    const history = await getSearchHistory(sessionId);
    expect(history).toHaveLength(1);
    expect(history[0].query).toBe("turmeric");
  });

  it("getSearchHistory returns empty when no identifier provided", async () => {
    const history = await getSearchHistory();
    expect(history).toEqual([]);
  });

  it("getSearchHistory respects limit parameter", async () => {
    await saveSearchHistory("query-1", 1, undefined, testUserId);
    await saveSearchHistory("query-2", 2, undefined, testUserId);
    await saveSearchHistory("query-3", 3, undefined, testUserId);

    const history = await getSearchHistory(undefined, testUserId, 2);
    expect(history).toHaveLength(2);
  });

  it("getPopularSearches returns queries sorted by count", async () => {
    // Save "chamomile" 3 times, "ginger" 2 times, "lavender" 1 time
    await saveSearchHistory("chamomile-popular", 5, sessionId);
    await saveSearchHistory("chamomile-popular", 5, undefined, testUserId);
    const extraUser = await createTestUser();
    await saveSearchHistory("chamomile-popular", 5, undefined, extraUser.id);
    await saveSearchHistory("ginger-popular", 3, sessionId);
    await saveSearchHistory("ginger-popular", 3, undefined, testUserId);
    await saveSearchHistory("lavender-popular", 1, sessionId);

    // Clean up extra user after test
    const result = await getPopularSearches(3);

    expect(result.length).toBeGreaterThanOrEqual(1);
    // The most popular query should have the highest count
    expect(result[0].count).toBeGreaterThanOrEqual(
      result[result.length - 1].count,
    );
    expect(result[0]).toHaveProperty("query");
    expect(result[0]).toHaveProperty("count");

    // Cleanup extra user
    await prisma.searchHistory.deleteMany({ where: { userId: extraUser.id } });
    await prisma.user.deleteMany({ where: { id: extraUser.id } });
  });

  it("clearSearchHistory deletes records by userId, returns count", async () => {
    await saveSearchHistory("delete-me-1", 1, undefined, testUserId);
    await saveSearchHistory("delete-me-2", 2, undefined, testUserId);

    const count = await clearSearchHistory(undefined, testUserId);
    expect(count).toBe(2);

    const remaining = await getSearchHistory(undefined, testUserId);
    expect(remaining).toHaveLength(0);
  });

  it("clearSearchHistory returns 0 when no identifier provided", async () => {
    await saveSearchHistory("keep-me", 1, sessionId);

    const count = await clearSearchHistory();
    expect(count).toBe(0);

    // Record should still exist
    const remaining = await getSearchHistory(sessionId);
    expect(remaining).toHaveLength(1);
  });
});
