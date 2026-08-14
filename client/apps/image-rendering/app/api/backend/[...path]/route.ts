import { proxyBackendRequest } from "@/lib/http/bff-proxy";

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const url = new URL(request.url);
  const backendPath = `/api/v1/${path.map(encodeURIComponent).join("/")}${url.search}`;
  return proxyBackendRequest(request, backendPath);
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
