const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:8080";

/** Forwards a same-origin BFF request to Spring while preserving the session cookie. */
export async function proxyBackendRequest(request: Request, path: string): Promise<Response> {
  const headers = new Headers({ accept: request.headers.get("accept") ?? "application/json" });
  const cookie = request.headers.get("cookie");
  const contentType = request.headers.get("content-type");
  if (cookie) headers.set("cookie", cookie);
  if (contentType) headers.set("content-type", contentType);

  const response = await fetch(`${backendUrl}${path}`, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  for (const name of [
    "content-type",
    "content-disposition",
    "set-cookie",
    "cache-control",
    "x-content-type-options",
    "content-security-policy",
  ]) {
    const value = response.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  const hasBody = ![204, 205, 304].includes(response.status);
  return new Response(hasBody ? response.body : null, {
    status: response.status,
    headers: responseHeaders,
  });
}
