package org.i19n.healthalst.modules.access.infrastructure.repository;

import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA adapter for account persistence. */
public interface UserRepository extends JpaRepository<User, UUID>, UserAccountPort {

    /** Finds a login account without making email casing part of the identity. */
    @Override
    Optional<User> findByEmailIgnoreCase(String email);

    /** Checks whether an initial account can be inserted without a duplicate email. */
    @Override
    boolean existsByEmailIgnoreCase(String email);
}
