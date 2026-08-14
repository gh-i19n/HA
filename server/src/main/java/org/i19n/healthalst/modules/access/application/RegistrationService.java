package org.i19n.healthalst.modules.access.application;

import java.text.Normalizer;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.AccountStatus;
import org.i19n.healthalst.modules.access.domain.MembershipStatus;
import org.i19n.healthalst.modules.access.domain.OrganizationRole;
import org.i19n.healthalst.modules.access.domain.UserRole;
import org.i19n.healthalst.modules.access.domain.model.Organization;
import org.i19n.healthalst.modules.access.domain.model.OrganizationMembership;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationMembershipRepository;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registration boundary for new laboratories only: patients are provisioned by
 * the platform during the public booking journey and staff are created by a
 * laboratory administrator, so no other self-registration surface exists.
 */
@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserAccountPort userAccountPort;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationService authenticationService;

    @Transactional
    public AuthenticationService.AuthenticationResult registerLaboratory(
            String ownerName,
            String email,
            String password,
            String laboratoryName,
            String location,
            String address
    ) {
        User owner = createUser(ownerName, email, password, UserRole.STAFF);
        Organization organization = new Organization();
        organization.setName(required(laboratoryName, "Laboratory name"));
        organization.setSlug(uniqueSlug(organization.getName()));
        organization.setEmail(owner.getEmail());
        organization.setLocation(blankToNull(location));
        organization.setAddress(blankToNull(address));
        organization = organizationRepository.save(organization);

        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(organization);
        membership.setUser(owner);
        membership.setRole(OrganizationRole.OWNER);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);
        return authenticationService.login(email, password);
    }

    private User createUser(String displayName, String email, String password, UserRole role) {
        String normalizedEmail = normalizeEmail(email);
        if (userAccountPort.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new AccessValidationException("An account with that email already exists.");
        }
        if (password == null || password.length() < 10) {
            throw new AccessValidationException("Use a password with at least 10 characters.");
        }
        User user = new User();
        user.setDisplayName(required(displayName, "Full name"));
        user.setEmail(normalizedEmail);
        user.setRole(role);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setPasswordHash(passwordEncoder.encode(password));
        return userAccountPort.save(user);
    }

    private String normalizeEmail(String email) {
        return required(email, "Email").toLowerCase(Locale.ROOT);
    }

    private String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new AccessValidationException(label + " is required.");
        }
        return value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String uniqueSlug(String value) {
        String base = Normalizer.normalize(value, Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (base.isBlank()) {
            base = "laboratory";
        }
        String candidate = base;
        int suffix = 2;
        while (organizationRepository.existsBySlug(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }
}
