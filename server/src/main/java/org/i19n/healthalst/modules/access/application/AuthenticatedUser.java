package org.i19n.healthalst.modules.access.application;

import java.util.UUID;
import org.i19n.healthalst.modules.access.domain.OrganizationRole;
import org.i19n.healthalst.modules.access.domain.UserRole;
import org.i19n.healthalst.modules.access.domain.model.OrganizationMembership;
import org.i19n.healthalst.modules.access.domain.model.Session;

/** Immutable security principal exposed from the access module to application use cases. */
public record AuthenticatedUser(
        UUID id,
        String email,
        String displayName,
        UserRole role,
        UUID organizationId,
        String organizationName,
        OrganizationRole organizationRole
) {

    /** Creates the principal from the persisted account loaded by the session adapter. */
    public static AuthenticatedUser from(Session session, OrganizationMembership membership) {
        var user = session.getUser();
        var organization = session.getActiveOrganization();
        return new AuthenticatedUser(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                organization == null ? null : organization.getId(),
                organization == null ? null : organization.getName(),
                membership == null ? null : membership.getRole()
        );
    }

    /** Returns whether this principal can perform staff operations. */
    public boolean isStaff() {
        return role == UserRole.STAFF && organizationId != null && organizationRole != null;
    }

    /** Returns whether this principal can perform patient operations. */
    public boolean isPatient() {
        return role == UserRole.PATIENT;
    }

    public boolean canManageOrganization() {
        return isStaff() && organizationRole.canManageOrganization();
    }

    public boolean canManageReports() {
        return isStaff() && organizationRole.canManageReports();
    }
}
