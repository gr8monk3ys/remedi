/**
 * A missing key is a fact about right now, not a permanent verdict.
 *
 * getOpenAIClient() used to set a module-level `aiDisabled = true` the first
 * time it ran without a key, and nothing ever cleared it. Configuring the key
 * afterwards did not bring AI search back until the process was replaced — on
 * Vercel, an unpredictable cold start with no way to tell whether it had
 * happened yet.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("openai", () => ({
  default: class FakeOpenAI {
    apiKey: string;
    constructor(opts: { apiKey: string }) {
      this.apiKey = opts.apiKey;
    }
  },
}));

const ORIGINAL = process.env.OPENAI_API_KEY;

describe("getOpenAIClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = ORIGINAL;
  });

  it("returns null while no key is configured", async () => {
    delete process.env.OPENAI_API_KEY;
    const { getOpenAIClient } = await import("@/lib/ai/client");
    expect(getOpenAIClient()).toBeNull();
  });

  it("recovers as soon as a key appears, without a process restart", async () => {
    delete process.env.OPENAI_API_KEY;
    const { getOpenAIClient, isAIEnabled } = await import("@/lib/ai/client");

    expect(getOpenAIClient()).toBeNull();
    expect(isAIEnabled()).toBe(false);

    process.env.OPENAI_API_KEY = "sk-appeared-later-1234567890";

    // Same module instance, no reset: this is the assertion the old latch failed.
    expect(getOpenAIClient()).not.toBeNull();
    expect(isAIEnabled()).toBe(true);
  });

  it("rebuilds the client when the key is rotated", async () => {
    process.env.OPENAI_API_KEY = "sk-first-key-1234567890";
    const { getOpenAIClient } = await import("@/lib/ai/client");

    const first = getOpenAIClient();
    expect(getOpenAIClient()).toBe(first); // cached while unchanged

    process.env.OPENAI_API_KEY = "sk-second-key-1234567890";
    const second = getOpenAIClient();

    expect(second).not.toBe(first);
    expect((second as unknown as { apiKey: string }).apiKey).toBe(
      "sk-second-key-1234567890",
    );
  });
});
