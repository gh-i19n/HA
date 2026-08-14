import { proxyBackendRequest } from "@/lib/http/bff-proxy";

/** Proxies the patient-owned available-results list request. */
export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return proxyBackendRequest(request, `/api/v1/patient/reports${query}`);
}
