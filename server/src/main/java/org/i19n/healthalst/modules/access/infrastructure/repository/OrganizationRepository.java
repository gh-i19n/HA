package org.i19n.healthalst.modules.access.infrastructure.repository;

import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.access.domain.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

/** JPA repository for clinic tenants. */
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    Optional<Organization> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
