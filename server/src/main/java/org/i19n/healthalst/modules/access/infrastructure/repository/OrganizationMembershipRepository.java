package org.i19n.healthalst.modules.access.infrastructure.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.access.domain.MembershipStatus;
import org.i19n.healthalst.modules.access.domain.OrganizationRole;
import org.i19n.healthalst.modules.access.domain.model.OrganizationMembership;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/** JPA repository that keeps organization membership predicates explicit. */
public interface OrganizationMembershipRepository extends JpaRepository<OrganizationMembership, UUID> {

    @EntityGraph(attributePaths = {"organization", "user"})
    List<OrganizationMembership> findByUserIdAndStatusOrderByOrganizationName(
            UUID userId,
            MembershipStatus status
    );

    @EntityGraph(attributePaths = {"organization", "user"})
    Optional<OrganizationMembership> findByUserIdAndOrganizationIdAndStatus(
            UUID userId,
            UUID organizationId,
            MembershipStatus status
    );

    @EntityGraph(attributePaths = {"organization", "user"})
    List<OrganizationMembership> findByOrganizationIdOrderByUserDisplayName(UUID organizationId);

    boolean existsByOrganizationIdAndUserId(UUID organizationId, UUID userId);

    long countByOrganizationIdAndRoleAndStatus(
            UUID organizationId,
            OrganizationRole role,
            MembershipStatus status
    );
}
