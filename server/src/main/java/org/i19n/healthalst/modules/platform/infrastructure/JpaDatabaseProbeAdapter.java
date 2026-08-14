package org.i19n.healthalst.modules.platform.infrastructure;

import org.i19n.healthalst.modules.platform.application.port.DatabaseProbePort;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;

/** Adapts the platform health use case to the shared JPA persistence boundary. */
@Component
public class JpaDatabaseProbeAdapter implements DatabaseProbePort {

    private final ApplicationMetadataRepository metadataRepository;

    public JpaDatabaseProbeAdapter(ApplicationMetadataRepository metadataRepository) {
        this.metadataRepository = metadataRepository;
    }

    /** Confirms the schema metadata can be read through JPA. */
    @Override
    public boolean isAvailable() {
        try {
            return metadataRepository.existsByMetadataKey("schema_version");
        } catch (DataAccessException exception) {
            return false;
        }
    }
}
