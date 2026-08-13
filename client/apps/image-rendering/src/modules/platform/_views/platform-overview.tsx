import { StatusBadge } from "@healthalst/ui/components/status-badge";

import { getPlatformStatus, type PlatformStatus } from "@/lib/platform-status";

async function getStatusOrUndefined(): Promise<PlatformStatus | undefined> {
  try {
    return await getPlatformStatus();
  } catch {
    return undefined;
  }
}

export async function PlatformOverview() {
  const status = await getStatusOrUndefined();

  if (status) {
    return (
      <main className="page-shell">
        <div className="page-content">
          <p className="eyebrow">healthAlst workspace</p>
          <h1>Ready for the first real module.</h1>
          <p className="lede">
            The monorepo and modular-monolith structure is in place and ready
            for validated healthAlst domain modules.
          </p>
          <section className="status-card" aria-labelledby="platform-heading">
            <div className="status-row">
              <div>
                <p className="eyebrow">System status</p>
                <h2 id="platform-heading">Full-stack connection</h2>
              </div>
              <StatusBadge>Connected</StatusBadge>
            </div>
            <dl className="status-meta">
              <div>
                <dt>API</dt>
                <dd>{status.service}</dd>
              </div>
              <div>
                <dt>PostgreSQL</dt>
                <dd>{status.databaseAvailable ? "Available" : "Unavailable"}</dd>
              </div>
              <div>
                <dt>Observed</dt>
                <dd>{new Date(status.observedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-content">
        <p className="eyebrow">healthAlst workspace</p>
        <h1>Frontend ready. Backend unavailable.</h1>
        <p className="lede">
          Start PostgreSQL and the Spring Boot server, then refresh this page.
        </p>
        <StatusBadge tone="warning">Connection needed</StatusBadge>
      </div>
    </main>
  );
}
