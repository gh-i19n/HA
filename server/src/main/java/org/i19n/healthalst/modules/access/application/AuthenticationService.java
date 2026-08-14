package org.i19n.healthalst.modules.access.application;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.port.SessionPort;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.model.Session;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.access.domain.AccountStatus;
import org.i19n.healthalst.modules.access.domain.MembershipStatus;
import org.i19n.healthalst.modules.access.domain.model.OrganizationMembership;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationMembershipRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Owns credential validation and the application session transaction boundary. */
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private static final long SESSION_HOURS = 8;

    private final UserAccountPort userAccountPort;
    private final SessionPort sessionPort;
    private final PasswordEncoder passwordEncoder;
    private final OrganizationMembershipRepository membershipRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Clock clock = Clock.systemUTC();

    /** Authenticates an account and persists a new opaque session token. */
    @Transactional
    public AuthenticationResult login(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new AuthenticationException("Email and password are required.");
        }

        User user = userAccountPort.findByEmailIgnoreCase(email.trim())
                .filter(candidate -> candidate.getAccountStatus() == AccountStatus.ACTIVE)
                .filter(candidate -> passwordEncoder.matches(password, candidate.getPasswordHash()))
                .orElseThrow(() -> new AuthenticationException("The email or password is incorrect."));

        Instant now = Instant.now(clock);
        sessionPort.deleteExpired(now);

        String rawToken = newToken();
        Session session = new Session();
        session.setTokenHash(hash(rawToken));
        session.setUser(user);
        OrganizationMembership membership = membershipRepository
                .findByUserIdAndStatusOrderByOrganizationName(user.getId(), MembershipStatus.ACTIVE)
                .stream()
                .findFirst()
                .orElse(null);
        session.setActiveOrganization(membership == null ? null : membership.getOrganization());
        session.setExpiresAt(now.plus(SESSION_HOURS, ChronoUnit.HOURS));
        user.setLastLoginAt(now);
        userAccountPort.save(user);
        session = sessionPort.save(session);

        return new AuthenticationResult(rawToken, AuthenticatedUser.from(session, membership));
    }

    /** Resolves the current principal from the hashed session token used by the security filter. */
    @Transactional
    public AuthenticatedUser authenticate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new AuthenticationException("Sign in is required.");
        }

        Session session = sessionPort.findActiveByTokenHash(hash(rawToken), Instant.now(clock))
                .filter(candidate -> candidate.getUser().getAccountStatus() == AccountStatus.ACTIVE)
                .orElseThrow(() -> new AuthenticationException("Your session has expired. Sign in again."));
        OrganizationMembership membership = activeMembership(session);
        if (session.getActiveOrganization() == null && membership == null) {
            membership = healUnassignedSession(session);
        }
        if (session.getActiveOrganization() != null && membership == null) {
            throw new AuthenticationException("Your clinic access is no longer active. Sign in again.");
        }
        return AuthenticatedUser.from(session, membership);
    }

    /**
     * Activates a clinic for a staff account that signed in before a clinic
     * owner or admin assigned it, so the next request picks up the workspace
     * without requiring another login. Sessions without any membership stay
     * organization-less and remain blocked from tenant-scoped operations.
     */
    private OrganizationMembership healUnassignedSession(Session session) {
        OrganizationMembership membership = membershipRepository
                .findByUserIdAndStatusOrderByOrganizationName(session.getUser().getId(), MembershipStatus.ACTIVE)
                .stream()
                .findFirst()
                .orElse(null);
        if (membership == null) {
            return null;
        }
        session.setActiveOrganization(membership.getOrganization());
        sessionPort.save(session);
        return membership;
    }

    /** Pins the current opaque session to one active clinic after a membership check. */
    @Transactional
    public AuthenticatedUser switchOrganization(String rawToken, java.util.UUID organizationId) {
        if (organizationId == null) {
            throw new AuthenticationException("Choose a clinic workspace.");
        }
        Session session = sessionPort.findActiveByTokenHash(hash(rawToken), Instant.now(clock))
                .orElseThrow(() -> new AuthenticationException("Your session has expired. Sign in again."));
        OrganizationMembership membership = membershipRepository
                .findByUserIdAndOrganizationIdAndStatus(
                        session.getUser().getId(), organizationId, MembershipStatus.ACTIVE)
                .orElseThrow(() -> new AuthenticationException("You do not have access to that clinic."));
        session.setActiveOrganization(membership.getOrganization());
        sessionPort.save(session);
        return AuthenticatedUser.from(session, membership);
    }

    private OrganizationMembership activeMembership(Session session) {
        if (session.getActiveOrganization() == null) {
            return null;
        }
        return membershipRepository.findByUserIdAndOrganizationIdAndStatus(
                session.getUser().getId(),
                session.getActiveOrganization().getId(),
                MembershipStatus.ACTIVE
        ).orElse(null);
    }

    /** Deletes the current session without failing if the browser has no token. */
    @Transactional
    public void logout(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        sessionPort.findActiveByTokenHash(hash(rawToken), Instant.now(clock))
                .ifPresent(sessionPort::delete);
    }

    /** Generates a cryptographically random token that is returned only to the browser. */
    private String newToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Hashes the browser token before it crosses the persistence boundary. */
    private String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    /** Carries the new cookie value and principal to the HTTP adapter. */
    public record AuthenticationResult(String token, AuthenticatedUser user) {}
}
