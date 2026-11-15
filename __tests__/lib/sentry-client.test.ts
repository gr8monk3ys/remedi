import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  captureException: vi.fn(),
  captureRouterTransitionStart: vi.fn(),
}));
const configLoads = vi.hoisted(() => ({ count: 0 }));

vi.mock("@/sentry.client.config", () => {
  configLoads.count += 1;
  return sdk;
});

const DSN = "https://public@o0.ingest.example.invalid/1";

async function freshClient(): Promise<typeof import("@/lib/sentry-client")> {
  vi.resetModules();
  return import("@/lib/sentry-client");
}

beforeEach(() => {
  configLoads.count = 0;
  sdk.captureException.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("lib/sentry-client", () => {
  it("never fetches the SDK where Sentry is gated off", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "");
    vi.stubEnv("VERCEL_ENV", "");

    const client = await freshClient();
    client.captureException(new Error("boom"));

    expect(client.loadSentry()).toBeNull();
    await vi.dynamicImportSettled();
    expect(configLoads.count).toBe(0);
  });

  it("loads the SDK once and forwards errors from error boundaries", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "production");

    const client = await freshClient();
    const error = new Error("boom");
    client.captureException(error);
    const first = client.loadSentry();
    const second = client.loadSentry();

    expect(first).toBe(second);
    await first;
    await vi.dynamicImportSettled();
    expect(configLoads.count).toBe(1);
    expect(sdk.captureException).toHaveBeenCalledWith(error);
  });
});
