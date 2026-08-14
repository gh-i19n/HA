package org.i19n.healthalst.modules.access.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.i19n.healthalst.modules.access.domain.MembershipStatus;
import org.i19n.healthalst.modules.access.domain.OrganizationRole;
import org.i19n.healthalst.shared.BaseEntity;

/** Assigns one independently revocable role to a user inside one clinic. */
@Entity
@Table(name = "organization_memberships")
@Getter
@Setter
@NoArgsConstructor
public class OrganizationMembership extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @jakarta.persistence.Column(nullable = false, length = 30)
    private OrganizationRole role;

    @Enumerated(EnumType.STRING)
    @jakarta.persistence.Column(nullable = false, length = 20)
    private MembershipStatus status;
}
