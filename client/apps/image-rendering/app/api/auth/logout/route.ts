import { proxyBackendRequest } from "@/lib/http/bff-proxy";

/** Proxies logout and forwards Spring's expired-cookie response. */
export async function POST(request: Request) {
  return proxyBackendRequest(request, "/api/v1/auth/logout");
}
