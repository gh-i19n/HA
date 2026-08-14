import { proxyBackendRequest } from "@/lib/http/bff-proxy";

/** Proxies an authorized patient PDF download. */
export async function GET(
  request: Request,
  context: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await context.params;
  return proxyBackendRequest(request, `/api/v1/patient/reports/${reportId}/content`);
}
