import { proxyBackendRequest } from "@/lib/http/bff-proxy";

/** Proxies the paginated staff report list request. */
export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return proxyBackendRequest(request, `/api/v1/staff/reports${query}`);
}

/** Proxies the multipart staff upload request without reconstructing its form body. */
export async function POST(request: Request) {
  return proxyBackendRequest(request, "/api/v1/staff/reports");
}
