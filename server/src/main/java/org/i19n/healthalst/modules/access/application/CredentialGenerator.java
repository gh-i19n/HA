package org.i19n.healthalst.modules.access.application;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

/** Generates strong platform-issued passwords that are never chosen by users or laboratories. */
@Component
public class CredentialGenerator {

    private static final String ALPHABET =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    private static final int LENGTH = 16;

    private final SecureRandom secureRandom = new SecureRandom();

    public String generatePassword() {
        StringBuilder password = new StringBuilder(LENGTH);
        for (int index = 0; index < LENGTH; index++) {
            password.append(ALPHABET.charAt(secureRandom.nextInt(ALPHABET.length())));
        }
        return password.toString();
    }
}
