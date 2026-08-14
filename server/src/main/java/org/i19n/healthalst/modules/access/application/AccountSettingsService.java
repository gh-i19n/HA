package org.i19n.healthalst.modules.access.application;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.MembershipStatus;
import org.i19n.healthalst.modules.access.domain.OrganizationRole;
import org.i19n.healthalst.modules.access.domain.UserRole;
import org.i19n.healthalst.modules.access.domain.model.OrganizationMembership;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.access.domain.model.UserNotificationPreference;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationMembershipRepository;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationRepository;
import org.i19n.healthalst.modules.access.infrastructure.repository.UserNotificationPreferenceRepository;
import org.i19n.healthalst.modules.notifications.application.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Owns profile, clinic, team, role, and notification settings transactions. */
@Service
@RequiredArgsConstructor
public class AccountSettingsService {

    private final UserAccountPort userAccountPort;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final UserNotificationPreferenceRepository preferenceRepository;
    private final NotificationService notificationService;
    private final StaffCredentialEmailService staffCredentialEmailService;
    private final CredentialGenerator credentialGenerator;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<OrganizationSummary> organizations(AuthenticatedUser actor) {
        return membershipRepository.findByUserIdAndStatusOrderByOrganizationName(
                actor.id(), MembershipStatus.ACTIVE).stream().map(OrganizationSummary::from).toList();
    }

    @Transactional
    public ProfileSummary updateProfile(AuthenticatedUser actor, String displayName, String phone, String avatarUrl) {
        var user = userAccountPort.findById(actor.id())
                .orElseThrow(() -> new AuthenticationException("Your account was not found."));
        if (displayName == null || displayName.isBlank()) {
            throw new AccessValidationException("Full name is required.");
        }
        user.setDisplayName(displayName.trim());
        user.setPhone(blankToNull(phone));
        user.setAvatarUrl(blankToNull(avatarUrl));
        return ProfileSummary.from(userAccountPort.save(user));
    }

    @Transactional(readOnly = true)
    public ClinicSummary clinic(AuthenticatedUser actor) {
        requireOrganizationAdmin(actor);
        return organizationRepository.findById(actor.organizationId())
                .map(ClinicSummary::from)
                .orElseThrow(() -> new AccessValidationException("The clinic was not found."));
    }

    @Transactional
    public ClinicSummary updateClinic(
            AuthenticatedUser actor,
            String name,
            String email,
            String phone,
            String address
    ) {
        requireOrganizationAdmin(actor);
        var organization = organizationRepository.findById(actor.organizationId())
                .orElseThrow(() -> new AccessValidationException("The clinic was not found."));
        if (name == null || name.isBlank()) {
            throw new AccessValidationException("Clinic name is required.");
        }
        organization.setName(name.trim());
        organization.setEmail(blankToNull(email));
        organization.setPhone(blankToNull(phone));
        organization.setAddress(blankToNull(address));
        return ClinicSummary.from(organizationRepository.save(organization));
    }

    @Transactional(readOnly = true)
    public List<MemberSummary> members(AuthenticatedUser actor) {
        requireOrganizationAdmin(actor);
        return membershipRepository.findByOrganizationIdOrderByUserDisplayName(actor.organizationId())
                .stream().map(MemberSummary::from).toList();
    }

    /**
     * Creates a staff account for the active laboratory with the assigned role.
     * The platform generates and emails the credentials; staff do not
     * self-register, so the laboratory never chooses or sees the password.
     */
    @Transactional
    public MemberSummary createMember(AuthenticatedUser actor, String displayName, String email, OrganizationRole role) {
        requireOrganizationAdmin(actor);
        if (role == null || role == OrganizationRole.OWNER) {
            throw new AccessValidationException("Choose Admin or Report staff for a new member.");
        }
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(java.util.Locale.ROOT);
        if (userAccountPort.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new AccessValidationException("An account with that email already exists.");
        }
        if (displayName == null || displayName.isBlank()) {
            throw new AccessValidationException("Full name is required.");
        }
        String password = credentialGenerator.generatePassword();
        User user = new User();
        user.setDisplayName(displayName.trim());
        user.setEmail(normalizedEmail);
        user.setRole(UserRole.STAFF);
        user.setAccountStatus(org.i19n.healthalst.modules.access.domain.AccountStatus.ACTIVE);
        user.setPasswordHash(passwordEncoder.encode(password));
        user = userAccountPort.save(user);

        var organization = organizationRepository.getReferenceById(actor.organizationId());
        var membership = new OrganizationMembership();
        membership.setOrganization(organization);
        membership.setUser(user);
        membership.setRole(role);
        membership.setStatus(MembershipStatus.ACTIVE);
        var saved = membershipRepository.save(membership);
        notificationService.createMembershipUpdate(
                actor.organizationId(), user.getId(), "LAB_MEMBERSHIP",
                "You were added to a laboratory",
                "You can now sign in and open the " + organization.getName() + " workspace.",
                "LAB", actor.organizationId());
        staffCredentialEmailService.sendCredentials(user, password, organization.getName(), role);
        return MemberSummary.from(saved);
    }

    @Transactional
    public MemberSummary updateMember(
            AuthenticatedUser actor,
            UUID membershipId,
            OrganizationRole role,
            MembershipStatus status
    ) {
        requireOrganizationAdmin(actor);
        var membership = membershipRepository.findById(membershipId)
                .filter(value -> value.getOrganization().getId().equals(actor.organizationId()))
                .orElseThrow(() -> new AccessValidationException("The clinic member was not found."));
        if (membership.getRole() == OrganizationRole.OWNER
                && (role != OrganizationRole.OWNER || status != MembershipStatus.ACTIVE)
                && membershipRepository.countByOrganizationIdAndRoleAndStatus(
                        actor.organizationId(), OrganizationRole.OWNER, MembershipStatus.ACTIVE) <= 1) {
            throw new AccessValidationException("The last active clinic owner cannot be removed or demoted.");
        }
        membership.setRole(role);
        membership.setStatus(status);
        var saved = membershipRepository.save(membership);
        notificationService.createMembershipUpdate(
                actor.organizationId(), saved.getUser().getId(), "CLINIC_MEMBERSHIP",
                "Your clinic access changed",
                "Your role in " + saved.getOrganization().getName() + " is now " + role + " (" + status + ").",
                "CLINIC", actor.organizationId());
        return MemberSummary.from(saved);
    }

    @Transactional
    public NotificationPreferenceSummary notificationPreferences(AuthenticatedUser actor) {
        var preference = preferenceRepository.findByUserId(actor.id()).orElseGet(() -> {
            var created = new UserNotificationPreference();
            created.setUser(userAccountPort.findById(actor.id()).orElseThrow());
            return preferenceRepository.save(created);
        });
        return NotificationPreferenceSummary.from(preference);
    }

    @Transactional
    public NotificationPreferenceSummary updateNotificationPreferences(
            AuthenticatedUser actor,
            boolean reportUpdates,
            boolean membershipUpdates,
            boolean emailUpdates
    ) {
        var preference = preferenceRepository.findByUserId(actor.id()).orElseGet(() -> {
            var created = new UserNotificationPreference();
            created.setUser(userAccountPort.findById(actor.id()).orElseThrow());
            return created;
        });
        preference.setReportUpdates(reportUpdates);
        preference.setMembershipUpdates(membershipUpdates);
        preference.setEmailUpdates(emailUpdates);
        return NotificationPreferenceSummary.from(preferenceRepository.save(preference));
    }

    private void requireOrganizationAdmin(AuthenticatedUser actor) {
        if (actor == null || !actor.canManageOrganization()) {
            throw new org.i19n.healthalst.modules.reports.application.ReportAuthorizationException(
                    "Clinic administrator access is required.");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record ProfileSummary(UUID id, String email, String displayName, String phone, String avatarUrl) {
        static ProfileSummary from(org.i19n.healthalst.modules.access.domain.model.User value) {
            return new ProfileSummary(value.getId(), value.getEmail(), value.getDisplayName(), value.getPhone(), value.getAvatarUrl());
        }
    }

    public record OrganizationSummary(UUID id, String name, String slug, OrganizationRole role) {
        static OrganizationSummary from(OrganizationMembership value) {
            return new OrganizationSummary(value.getOrganization().getId(), value.getOrganization().getName(), value.getOrganization().getSlug(), value.getRole());
        }
    }

    public record ClinicSummary(UUID id, String name, String slug, String email, String phone, String address) {
        static ClinicSummary from(org.i19n.healthalst.modules.access.domain.model.Organization value) {
            return new ClinicSummary(value.getId(), value.getName(), value.getSlug(), value.getEmail(), value.getPhone(), value.getAddress());
        }
    }

    public record MemberSummary(UUID id, UUID userId, String displayName, String email, OrganizationRole role, MembershipStatus status) {
        static MemberSummary from(OrganizationMembership value) {
            return new MemberSummary(value.getId(), value.getUser().getId(), value.getUser().getDisplayName(), value.getUser().getEmail(), value.getRole(), value.getStatus());
        }
    }

    public record NotificationPreferenceSummary(boolean reportUpdates, boolean membershipUpdates, boolean emailUpdates) {
        static NotificationPreferenceSummary from(UserNotificationPreference value) {
            return new NotificationPreferenceSummary(value.isReportUpdates(), value.isMembershipUpdates(), value.isEmailUpdates());
        }
    }
}
