package org.i19n.healthalst.modules.access.application.port;

import java.time.Instant;
import java.util.Optional;
import org.i19n.healthalst.modules.access.domain.model.Session;

/** Application-facing persistence contract for server-side login sessions. */
public interface SessionPort {

    Optional<Session> findActiveByTokenHash(String tokenHash, Instant now);

    void deleteExpired(Instant now);

    Session save(Session session);

    void delete(Session session);
}
