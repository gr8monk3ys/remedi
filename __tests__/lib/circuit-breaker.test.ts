/**
 * Tests for the circuit breaker that guards the OpenAI and OpenFDA clients
 * (lib/ai/client.ts, lib/openFDA.ts).
 *
 * The property under test: after `failureThreshold` consecutive failures the
 * breaker trips OPEN and rejects every call immediately — no more calls
 * reach the wrapped function — until `resetTimeoutMs` has passed, at which
 * point exactly one HALF_OPEN probe is let through. That probe's outcome
 * decides everything: success closes the breaker and resets the failure
 * count, failure reopens it immediately (not after another full threshold).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CircuitBreaker, CircuitBreakerOpenError } from "@/lib/circuit-breaker";

function failing(error: unknown = new Error("boom")) {
  return vi.fn().mockRejectedValue(error);
}

function succeeding<T>(value: T) {
  return vi.fn().mockResolvedValue(value);
}

describe("CircuitBreaker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays CLOSED and calls through while under the failure threshold", async () => {
    const breaker = new CircuitBreaker({ name: "test", failureThreshold: 3 });
    const fn = failing();

    await expect(breaker.call(fn)).rejects.toThrow("boom");
    await expect(breaker.call(fn)).rejects.toThrow("boom");

    expect(breaker.getState()).toBe("CLOSED");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("trips OPEN on the Nth consecutive failure and rejects further calls without invoking fn", async () => {
    const breaker = new CircuitBreaker({ name: "test", failureThreshold: 2 });
    const fn = failing();

    await expect(breaker.call(fn)).rejects.toThrow("boom");
    await expect(breaker.call(fn)).rejects.toThrow("boom");
    expect(breaker.getState()).toBe("OPEN");

    fn.mockClear();
    await expect(breaker.call(fn)).rejects.toThrow(CircuitBreakerOpenError);
    expect(fn).not.toHaveBeenCalled();
  });

  it("names the breaker in the open-circuit error", async () => {
    const breaker = new CircuitBreaker({ name: "fda", failureThreshold: 1 });
    await expect(breaker.call(failing())).rejects.toThrow("boom");

    await expect(breaker.call(failing())).rejects.toThrow(
      'Circuit breaker "fda" is OPEN — requests are being rejected',
    );
  });

  it("a success resets the failure count so isolated failures never trip it", async () => {
    const breaker = new CircuitBreaker({ name: "test", failureThreshold: 2 });

    await expect(breaker.call(failing())).rejects.toThrow("boom");
    await breaker.call(succeeding("ok"));

    // Back below threshold after the reset, so one more failure alone must
    // not trip the breaker.
    await expect(breaker.call(failing())).rejects.toThrow("boom");
    expect(breaker.getState()).toBe("CLOSED");
  });

  it("moves OPEN to HALF_OPEN only after resetTimeoutMs has elapsed", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 1,
      resetTimeoutMs: 30_000,
    });
    await expect(breaker.call(failing())).rejects.toThrow("boom");
    expect(breaker.getState()).toBe("OPEN");

    vi.advanceTimersByTime(29_999);
    await expect(breaker.call(failing())).rejects.toThrow(
      CircuitBreakerOpenError,
    );
    expect(breaker.getState()).toBe("OPEN");

    vi.advanceTimersByTime(1);
    // The probe itself succeeds, proving the gate let the call through.
    const probe = succeeding("recovered");
    await expect(breaker.call(probe)).resolves.toBe("recovered");
    expect(probe).toHaveBeenCalledTimes(1);
    expect(breaker.getState()).toBe("CLOSED");
  });

  it("a successful HALF_OPEN probe closes the breaker and clears the failure count", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 2,
      resetTimeoutMs: 10_000,
    });
    await expect(breaker.call(failing())).rejects.toThrow("boom");
    await expect(breaker.call(failing())).rejects.toThrow("boom");
    expect(breaker.getState()).toBe("OPEN");
    vi.advanceTimersByTime(10_000);

    await breaker.call(succeeding("ok"));
    expect(breaker.getState()).toBe("CLOSED");

    // A single subsequent failure must not reopen it — the count was reset.
    await expect(breaker.call(failing())).rejects.toThrow("boom");
    expect(breaker.getState()).toBe("CLOSED");
  });

  it("a failed HALF_OPEN probe reopens immediately, without needing another full threshold", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 5,
      resetTimeoutMs: 10_000,
    });

    for (let i = 0; i < 5; i++) {
      await expect(breaker.call(failing())).rejects.toThrow("boom");
    }
    expect(breaker.getState()).toBe("OPEN");

    vi.advanceTimersByTime(10_000);
    // One failed probe in HALF_OPEN — must reopen right away, not require
    // five more failures.
    await expect(breaker.call(failing())).rejects.toThrow("boom");
    expect(breaker.getState()).toBe("OPEN");

    const fn = failing();
    await expect(breaker.call(fn)).rejects.toThrow(CircuitBreakerOpenError);
    expect(fn).not.toHaveBeenCalled();
  });
});
