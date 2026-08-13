export type PlatformStatus = {
  service: string;
  status: "UP";
  databaseAvailable: boolean;
  observedAt: string;
};

function isPlatformStatus(value: unknown): value is PlatformStatus {
  if (typeof value !== "object" || value === null) return false;

  const status = value as Record<string, unknown>;
  return (
    typeof status.service === "string" &&
    status.status === "UP" &&
    typeof status.databaseAvailable === "boolean" &&
    typeof status.observedAt === "string"
  );
}

export async function getPlatformStatus(fetcher: typeof fetch = fetch): Promise<PlatformStatus> {
  const apiBaseUrl = process.env.BACKEND_API_URL ?? "http://localhost:8080";
  const response = await fetcher(`${apiBaseUrl}/api/v1/platform/status`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Platform status request failed with ${response.status}`);
  }

  const body: unknown = await response.json();
  if (!isPlatformStatus(body)) {
    throw new Error("Platform status response did not match the contract");
  }

  return body;
}

