/**
 * Tests for the API client.
 *
 * This is the only adapter between the app and its own API now, so its
 * failure handling is the app's failure handling. The cases below are the
 * ones it previously got wrong: it trusted the body over the transport, and
 * it threw raw TypeErrors that every `instanceof ApiClientError` check missed.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { apiClient, ApiClientError } from "@/lib/api/client";

function respond(
  body: unknown,
  init: {
    status?: number;
    ok?: boolean;
    contentType?: string;
    headers?: Record<string, string>;
  } = {},
) {
  const status = init.status ?? 200;
  global.fetch = vi.fn().mockResolvedValue({
    ok: init.ok ?? status < 400,
    status,
    headers: new Headers({
      "content-type": init.contentType ?? "application/json",
      ...init.headers,
    }),
    json: async () => body,
  } as unknown as Response);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("success", () => {
  it("returns the envelope's data", async () => {
    respond({ success: true, data: { name: "Turmeric" } });
    await expect(apiClient.get("/api/x")).resolves.toEqual({
      name: "Turmeric",
    });
  });
});

describe("the transport and the body must agree", () => {
  it("rejects a failing status even when the body claims success", async () => {
    // A 500 carrying success:true used to be returned as a value.
    respond({ success: true, data: { name: "Turmeric" } }, { status: 500 });

    await expect(apiClient.get("/api/x")).rejects.toBeInstanceOf(
      ApiClientError,
    );
  });

  it("rejects a success body on a 403", async () => {
    respond({ success: true, data: [] }, { status: 403 });
    await expect(apiClient.get("/api/x")).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});

describe("malformed failures still produce an ApiClientError", () => {
  it("handles an error envelope with no error key", async () => {
    // This used to throw `TypeError: Cannot read properties of undefined`.
    respond({ success: false }, { status: 400 });

    const error = await apiClient.get("/api/x").catch((e) => e);
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error.statusCode).toBe(400);
  });

  it("handles a body that is not JSON at all", async () => {
    respond("<html>502</html>", { status: 502, contentType: "text/html" });

    const error = await apiClient.get("/api/x").catch((e) => e);
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error.statusCode).toBe(502);
  });

  it("handles a body that fails to parse", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => {
        throw new Error("Unexpected end of JSON input");
      },
    } as unknown as Response);

    await expect(apiClient.get("/api/x")).rejects.toBeInstanceOf(
      ApiClientError,
    );
  });
});

describe("transport failures", () => {
  it("wraps a network error so callers have one error type", async () => {
    // Previously a raw TypeError, which every instanceof check missed.
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    const error = await apiClient.get("/api/x").catch((e) => e);
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error.statusCode).toBe(0);
  });

  it("lets an aborted request stay an AbortError", async () => {
    // Callers cancel superseded requests and must be able to tell that apart
    // from a real failure.
    global.fetch = vi
      .fn()
      .mockRejectedValue(new DOMException("Aborted", "AbortError"));

    const error = await apiClient.get("/api/x").catch((e) => e);
    expect(error).toBeInstanceOf(DOMException);
    expect(error.name).toBe("AbortError");
    expect(error).not.toBeInstanceOf(ApiClientError);
  });
});

describe("error detail", () => {
  it("carries code, message and retryAfter from the envelope", async () => {
    respond(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests.",
          statusCode: 429,
          retryAfter: 30,
        },
      },
      { status: 429 },
    );

    const error = await apiClient.get("/api/x").catch((e) => e);
    expect(error).toMatchObject({
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests.",
      statusCode: 429,
      retryAfter: 30,
    });
  });

  it("falls back to the Retry-After header when the envelope omits it", async () => {
    // `rateLimitExceededResponse` sends `retryAfter: undefined` in the body
    // whenever the limiter could not compute one, but still emits a header.
    // Reading only the body turns a specific "wait 12s" into a vague message.
    respond(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests.",
          statusCode: 429,
        },
      },
      { status: 429, headers: { "Retry-After": "12" } },
    );

    const error = await apiClient.get("/api/x").catch((e) => e);
    expect(error.retryAfter).toBe(12);
  });

  it("prefers the envelope's retryAfter over the header", async () => {
    respond(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests.",
          statusCode: 429,
          retryAfter: 30,
        },
      },
      { status: 429, headers: { "Retry-After": "12" } },
    );

    const error = await apiClient.get("/api/x").catch((e) => e);
    expect(error.retryAfter).toBe(30);
  });

  it("reads a nested details.retryAfter when that is the only source", async () => {
    respond(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests.",
          statusCode: 429,
          details: { retryAfter: 45 },
        },
      },
      { status: 429 },
    );

    const error = await apiClient.get("/api/x").catch((e) => e);
    expect(error.retryAfter).toBe(45);
  });

  it("leaves retryAfter undefined when no source carries a usable value", async () => {
    respond(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Boom", statusCode: 500 },
      },
      { status: 500, headers: { "Retry-After": "not-a-number" } },
    );

    const error = await apiClient.get("/api/x").catch((e) => e);
    expect(error.retryAfter).toBeUndefined();
  });
});
