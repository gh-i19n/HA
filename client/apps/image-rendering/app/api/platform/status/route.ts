import { getPlatformStatus } from "@/lib/platform-status";

export async function GET() {
  try {
    return Response.json(await getPlatformStatus());
  } catch {
    return Response.json(
      {
        type: "about:blank",
        title: "Service unavailable",
        status: 503,
        detail: "The backend platform status could not be retrieved.",
      },
      { status: 503 },
    );
  }
}

