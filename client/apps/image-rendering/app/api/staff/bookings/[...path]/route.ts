import { proxyBackendRequest } from "@/lib/http/bff-proxy";

/** Proxies booking decisions such as approve and reject. */
export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const backendPath = `/api/v1/staff/bookings/${path.map(encodeURIComponent).join("/")}`;
  return proxyBackendRequest(request, backendPath);
}