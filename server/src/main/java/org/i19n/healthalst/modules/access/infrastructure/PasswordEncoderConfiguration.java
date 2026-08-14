package org.i19n.healthalst.modules.access.infrastructure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Provides credential hashing without coupling the security filter configuration to the service. */
@Configuration
public class PasswordEncoderConfiguration {

    /** Provides the password hashing implementation used by account creation and login. */
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
