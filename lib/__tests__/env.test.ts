import { afterEach, describe, expect, it } from "vitest";
import { isDemoDataEnabled } from "../env";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
const ORIGINAL_DEMO_MODE = process.env.DEMO_MODE;

function setEnv(nodeEnv: string | undefined, demoMode: string | undefined) {
  if (nodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = nodeEnv;
  }
  if (demoMode === undefined) {
    delete process.env.DEMO_MODE;
  } else {
    process.env.DEMO_MODE = demoMode;
  }
}

afterEach(() => {
  setEnv(ORIGINAL_NODE_ENV, ORIGINAL_DEMO_MODE);
});

describe("isDemoDataEnabled", () => {
  it("is disabled in production by default", () => {
    setEnv("production", undefined);
    expect(isDemoDataEnabled()).toBe(false);
  });

  it("is enabled in development by default", () => {
    setEnv("development", undefined);
    expect(isDemoDataEnabled()).toBe(true);
  });

  it("is enabled in test by default", () => {
    setEnv("test", undefined);
    expect(isDemoDataEnabled()).toBe(true);
  });

  it("DEMO_MODE=true forces it on, even in production", () => {
    setEnv("production", "true");
    expect(isDemoDataEnabled()).toBe(true);
  });

  it("DEMO_MODE=false forces it off, even outside production", () => {
    setEnv("development", "false");
    expect(isDemoDataEnabled()).toBe(false);
  });
});
