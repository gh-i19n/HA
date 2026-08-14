package org.i19n.healthalst.modules.platform.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Represents the small Flyway-managed metadata record used by the platform probe. */
@Entity
@Table(name = "application_metadata")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationMetadata {

    @Id
    private UUID id;

    @Column(name = "metadata_key", nullable = false, unique = true, length = 100)
    private String metadataKey;

    @Column(name = "metadata_value", nullable = false, length = 255)
    private String metadataValue;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
