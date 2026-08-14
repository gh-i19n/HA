import { proxyBackendRequest } from "@/lib/http/bff-proxy";

/** Proxies staff publication for one report. */
export async function POST(
  request: Request,
  context: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await context.params;
  return proxyBackendRequest(request, `/api/v1/staff/reports/${reportId}/publish`);
}
