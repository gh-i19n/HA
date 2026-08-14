package org.i19n.healthalst.modules.access.application;

import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Issues the patient's first usable password at report-availability time.
 * The plaintext is returned exactly once for the credential email and is never
 * stored or logged; later publications only carry the portal link.
 */
@Service
@RequiredArgsConstructor
public class PatientCredentialService {

    private final UserAccountPort userAccountPort;
    private final PasswordEncoder passwordEncoder;
    private final CredentialGenerator credentialGenerator;

    @Transactional
    public String issuePasswordIfNeverSignedIn(User patient) {
        if (patient == null || patient.getLastLoginAt() != null) {
            return null;
        }
        String password = credentialGenerator.generatePassword();
        patient.setPasswordHash(passwordEncoder.encode(password));
        userAccountPort.save(patient);
        return password;
    }
}
