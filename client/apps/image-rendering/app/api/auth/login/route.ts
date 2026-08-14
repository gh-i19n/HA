import { proxyBackendRequest } from "@/lib/http/bff-proxy";

/** Proxies the login request so Spring's HttpOnly session cookie is set on this origin. */
export async function POST(request: Request) {
  return proxyBackendRequest(request, "/api/v1/auth/login");
}
