package org.i19n.healthalst.modules.access.interfaces.dto;

import java.util.UUID;
import org.i19n.healthalst.modules.access.application.AuthenticatedUser;

/** Stable session context; password and session values never leave the server. */
public record UserResponse(
        UUID id,
        String email,
        String displayName,
        String role,
        UUID organizationId,
        String organizationName,
        String organizationRole
) {

    /** Maps the application principal to its HTTP response shape. */
    public static UserResponse from(AuthenticatedUser user) {
        return new UserResponse(
                user.id(),
                user.email(),
                user.displayName(),
                user.role().name(),
                user.organizationId(),
                user.organizationName(),
                user.organizationRole() == null ? null : user.organizationRole().name()
        );
    }
}
