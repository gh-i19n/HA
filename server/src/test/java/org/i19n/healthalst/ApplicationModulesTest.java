package org.i19n.healthalst;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ApplicationModulesTest {

    @Test
    void verifiesModularStructure() {
        ApplicationModules.of(HealthAlstApplication.class).verify();
    }
}

