/**
 * Unit Tests for Session Management
 *
 * Tests session ID generation and storage.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Session Management", () => {
  // Store originals
  let originalLocalStorage: Storage;
  let mockLocalStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.resetModules();

    // Create mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    // Store original localStorage
    originalLocalStorage = window.localStorage;

    // Replace localStorage with mock
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    // Mock crypto.randomUUID
    Object.defineProperty(global, "crypto", {
      value: {
        randomUUID: vi.fn(() => "550e8400-e29b-41d4-a716-446655440000"),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  describe("getSessionId", () => {
    it("should return existing session ID from localStorage", async () => {
      const existingId = "123e4567-e89b-12d3-a456-426614174000";
      mockLocalStorage.getItem.mockReturnValue(existingId);

      const { getSessionId } = await import("../session");
      const sessionId = getSessionId();

      expect(sessionId).toBe(existingId);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "remedi_session_id",
      );
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it("should generate and store new session ID when none exists", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { getSessionId } = await import("../session");
      const sessionId = getSessionId();

      expect(sessionId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "remedi_session_id",
        "550e8400-e29b-41d4-a716-446655440000",
      );
    });

    it("should return empty string when not in browser environment", async () => {
      // Save and delete window
      const originalWindow = global.window;
      // @ts-expect-error - Testing server-side behavior
      delete global.window;

      vi.resetModules();
      const { getSessionId } = await import("../session");
      const sessionId = getSessionId();

      expect(sessionId).toBe("");

      // Restore window
      global.window = originalWindow;
    });

    it("should handle localStorage errors gracefully", async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("localStorage not available");
      });

      // Suppress console.warn for this test
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { getSessionId } = await import("../session");
      const sessionId = getSessionId();

      // Should still return a UUID
      expect(sessionId).toBeTruthy();
      expect(sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );

      warnSpy.mockRestore();
    });

    it("should use fallback UUID generation when crypto.randomUUID unavailable", async () => {
      // Remove crypto.randomUUID
      Object.defineProperty(global, "crypto", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      mockLocalStorage.getItem.mockReturnValue(null);

      vi.resetModules();
      const { getSessionId } = await import("../session");
      const sessionId = getSessionId();

      // Should still generate a valid UUID-like string
      expect(sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe("clearSessionId", () => {
    it("should remove session ID from localStorage", async () => {
      const { clearSessionId } = await import("../session");
      clearSessionId();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "remedi_session_id",
      );
    });

    it("should handle non-browser environment", async () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server-side behavior
      delete global.window;

      vi.resetModules();
      const { clearSessionId } = await import("../session");

      // Should not throw
      expect(() => clearSessionId()).not.toThrow();

      global.window = originalWindow;
    });

    it("should handle localStorage errors gracefully", async () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error("localStorage not available");
      });

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { clearSessionId } = await import("../session");

      // Should not throw
      expect(() => clearSessionId()).not.toThrow();

      warnSpy.mockRestore();
    });
  });

  describe("hasSessionId", () => {
    it("should return true when session ID exists", async () => {
      mockLocalStorage.getItem.mockReturnValue("existing-session-id");

      const { hasSessionId } = await import("../session");
      const result = hasSessionId();

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "remedi_session_id",
      );
    });

    it("should return false when session ID does not exist", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { hasSessionId } = await import("../session");
      const result = hasSessionId();

      expect(result).toBe(false);
    });

    it("should return false in non-browser environment", async () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server-side behavior
      delete global.window;

      vi.resetModules();
      const { hasSessionId } = await import("../session");
      const result = hasSessionId();

      expect(result).toBe(false);

      global.window = originalWindow;
    });

    it("should return false when localStorage throws", async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("localStorage not available");
      });

      const { hasSessionId } = await import("../session");
      const result = hasSessionId();

      expect(result).toBe(false);
    });
  });
});
