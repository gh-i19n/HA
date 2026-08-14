package org.i19n.healthalst.modules.access.infrastructure.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.access.application.port.SessionPort;
import org.i19n.healthalst.modules.access.domain.model.Session;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Spring Data JPA adapter that loads the account with an active session. */
public interface SessionRepository extends JpaRepository<Session, UUID>, SessionPort {

    /** Fetches the session owner in the same persistence operation for the security filter. */
    @Override
    @EntityGraph(attributePaths = {"user", "activeOrganization"})
    @Query("select s from Session s join fetch s.user left join fetch s.activeOrganization where s.tokenHash = :tokenHash and s.expiresAt > :now")
    Optional<Session> findActiveByTokenHash(@Param("tokenHash") String tokenHash, @Param("now") Instant now);

    /** Removes expired sessions as part of the login cleanup boundary. */
    @Override
    @Modifying
    @Query("delete from Session s where s.expiresAt <= :now")
    void deleteExpired(@Param("now") Instant now);
}
