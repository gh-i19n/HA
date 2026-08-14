package org.i19n.healthalst.modules.access.infrastructure.repository;

import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.access.domain.model.UserNotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

/** JPA repository for account notification settings. */
public interface UserNotificationPreferenceRepository extends JpaRepository<UserNotificationPreference, UUID> {
    Optional<UserNotificationPreference> findByUserId(UUID userId);
}
