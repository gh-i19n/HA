package org.i19n.healthalst.modules.platform.infrastructure;

import java.util.UUID;
import org.i19n.healthalst.modules.platform.domain.ApplicationMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA access to the Flyway metadata table. */
public interface ApplicationMetadataRepository extends JpaRepository<ApplicationMetadata, UUID> {

    /** Checks that Flyway established the application schema before reporting readiness. */
    boolean existsByMetadataKey(String metadataKey);
}
