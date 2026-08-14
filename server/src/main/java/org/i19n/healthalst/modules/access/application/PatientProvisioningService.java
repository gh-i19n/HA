package org.i19n.healthalst.modules.access.application;

import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.AccountStatus;
import org.i19n.healthalst.modules.access.domain.UserRole;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates or reuses the single patient account keyed by normalized email.
 * A brand-new account receives a throwaway hash that is replaced the first time
 * a report becomes available, so the emailed password is always valid at
 * delivery time and the plaintext never outlives the email.
 */
@Service
@RequiredArgsConstructor
public class PatientProvisioningService {

    private final UserAccountPort userAccountPort;
    private final PasswordEncoder passwordEncoder;
    private final CredentialGenerator credentialGenerator;

    @Transactional
    public ProvisionedPatient provision(String email, String displayName) {
        String normalizedEmail = required(email, "Email").toLowerCase(Locale.ROOT);
        User existing = userAccountPort.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (existing != null) {
            return new ProvisionedPatient(existing, false);
        }
        User user = new User();
        user.setEmail(normalizedEmail);
        user.setDisplayName(required(displayName, "Full name"));
        user.setRole(UserRole.PATIENT);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setPasswordHash(passwordEncoder.encode(credentialGenerator.generatePassword()));
        return new ProvisionedPatient(userAccountPort.save(user), true);
    }

    private String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new AccessValidationException(label + " is required.");
        }
        return value.trim();
    }

    public record ProvisionedPatient(User user, boolean created) {}
}
