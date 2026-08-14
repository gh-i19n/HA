package org.i19n.healthalst.modules.access.application;

/** Signals invalid credentials or an expired login session. */
public class AuthenticationException extends RuntimeException {

    public AuthenticationException(String message) {
        super(message);
    }
}
