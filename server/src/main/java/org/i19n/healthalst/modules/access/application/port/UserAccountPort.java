package org.i19n.healthalst.modules.access.application.port;

import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.access.domain.model.User;

/** Application-facing persistence contract for account lookup and creation. */
public interface UserAccountPort {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findById(UUID id);

    User save(User user);
}
