package org.i19n.healthalst.modules.platform.interfaces.dto;

import java.time.Instant;
import org.i19n.healthalst.modules.platform.domain.PlatformStatus;

public record PlatformStatusResponse(
        String service,
        String status,
        boolean databaseAvailable,
        Instant observedAt
) {
    public static PlatformStatusResponse from(PlatformStatus status) {
        return new PlatformStatusResponse(
                status.service(),
                status.availability().name(),
                status.databaseAvailable(),
                status.observedAt()
        );
    }
}

