package org.i19n.healthalst;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/** Proves the Spring Modulith architecture stays valid: exposure, dependency direction, and cycles. */
class ModulithVerificationTest {

    @Test
    void moduleArchitectureIsValid() {
        ApplicationModules.of(HealthAlstApplication.class).verify();
    }
}