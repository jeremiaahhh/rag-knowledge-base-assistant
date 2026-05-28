import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, api } from "@/lib/api";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("api client", () => {
  it("targets the configured base URL when fetching health", async () => {
    const mock = vi.fn(async () =>
      new Response(
        JSON.stringify({ status: "ok", app: "test", env: "dev", mock_ai: true }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    globalThis.fetch = mock as unknown as typeof fetch;

    const health = await api.health();
    expect(health.status).toBe("ok");
    expect(mock).toHaveBeenCalledWith(
      expect.stringMatching(/\/health$/),
      expect.any(Object),
    );
  });

  it("parses backend error payloads into ApiError", async () => {
    const body = {
      error: { code: "ingestion_error", message: "boom", details: {} },
    };
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(body), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })) as unknown as typeof fetch;

    await expect(api.chat("hi")).rejects.toMatchObject({
      name: "Error",
      message: "boom",
      status: 400,
      code: "ingestion_error",
    });
    await expect(api.chat("hi")).rejects.toBeInstanceOf(ApiError);
  });
});
