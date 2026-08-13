import { describe, expect, it, vi } from "vitest";

import { getPlatformStatus } from "./platform-status";

describe("getPlatformStatus", () => {
  it("returns a valid status contract", async () => {
    const body = {
      service: "healthAlst-api",
      status: "UP",
      databaseAvailable: true,
      observedAt: "2026-08-13T10:00:00Z",
    } as const;
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(getPlatformStatus(fetcher)).resolves.toEqual(body);
  });

  it("rejects malformed responses", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ status: "UP" }), { status: 200 }),
    );

    await expect(getPlatformStatus(fetcher)).rejects.toThrow("did not match the contract");
  });
});

