package org.i19n.healthalst.modules.notifications.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.notifications.domain.UserNotification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/** JPA repository with recipient and active-tenant predicates in every read path. */
public interface UserNotificationRepository extends JpaRepository<UserNotification, UUID> {
    List<UserNotification> findByRecipientIdAndOrganizationIdOrderByCreatedAtDesc(
            UUID recipientId, UUID organizationId, Pageable pageable);
    List<UserNotification> findByRecipientIdAndOrganizationIdIsNullOrderByCreatedAtDesc(
            UUID recipientId, Pageable pageable);
    Optional<UserNotification> findByIdAndRecipientId(UUID id, UUID recipientId);
    long countByRecipientIdAndOrganizationIdAndReadAtIsNull(UUID recipientId, UUID organizationId);
    long countByRecipientIdAndOrganizationIdIsNullAndReadAtIsNull(UUID recipientId);
}
