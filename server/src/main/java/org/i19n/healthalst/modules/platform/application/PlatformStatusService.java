package org.i19n.healthalst.modules.platform.application;

import java.time.Clock;
import java.time.Instant;
import org.i19n.healthalst.modules.platform.application.port.DatabaseProbePort;
import org.i19n.healthalst.modules.platform.domain.PlatformStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformStatusService {

    private final DatabaseProbePort databaseProbe;
    private final Clock clock;

    public PlatformStatusService(DatabaseProbePort databaseProbe) {
        this.databaseProbe = databaseProbe;
        this.clock = Clock.systemUTC();
    }

    @Transactional(readOnly = true)
    public PlatformStatus getStatus() {
        boolean databaseAvailable = databaseProbe.isAvailable();
        if (!databaseAvailable) {
            throw new PlatformUnavailableException(
                    "Database probe did not complete",
                    new IllegalStateException("Database unavailable")
            );
        }

        return new PlatformStatus(
                "healthAlst-api",
                PlatformStatus.Availability.UP,
                true,
                Instant.now(clock)
        );
    }
}
