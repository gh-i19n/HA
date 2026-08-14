import { proxyBackendRequest } from "@/lib/http/bff-proxy";

/** Proxies the current-account request with the browser session attached server-side. */
export async function GET(request: Request) {
  const response = await proxyBackendRequest(request, "/api/v1/auth/me");
  return response.status === 401 ? Response.json(null) : response;
}
