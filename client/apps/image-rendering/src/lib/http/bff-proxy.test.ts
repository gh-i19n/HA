import { afterEach, describe, expect, it, vi } from "vitest";
import { proxyBackendRequest } from "./bff-proxy";

describe("proxyBackendRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards a no-content response without constructing an invalid response body", async () => {
    const backendResponse = new Response(null, {
      status: 204,
      headers: { "set-cookie": "healthalst_session=; Max-Age=0; Path=/" },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(backendResponse));

    const response = await proxyBackendRequest(
      new Request("http://localhost:3003/api/auth/logout", { method: "POST" }),
      "/api/v1/auth/logout",
    );

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
