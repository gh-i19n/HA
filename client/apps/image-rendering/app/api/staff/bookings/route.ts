import { proxyBackendRequest } from "@/lib/http/bff-proxy";

/** Proxies the staff booking selector request. */
export async function GET(request: Request) {
  return proxyBackendRequest(request, "/api/v1/staff/bookings");
}
