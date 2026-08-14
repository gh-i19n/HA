package org.i19n.healthalst.modules.access.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.i19n.healthalst.shared.BaseEntity;

/** Represents an expiring server-side login session identified by a hashed token. */
@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
public class Session extends BaseEntity {

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_organization_id")
    private Organization activeOrganization;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
