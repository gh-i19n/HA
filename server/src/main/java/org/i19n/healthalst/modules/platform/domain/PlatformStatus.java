package org.i19n.healthalst.modules.platform.domain;

import java.time.Instant;

public record PlatformStatus(
        String service,
        Availability availability,
        boolean databaseAvailable,
        Instant observedAt
) {
    public enum Availability {
        UP
    }
}

