package org.i19n.healthalst.modules.access.application;

/** Represents invalid identity, membership, or settings input. */
public class AccessValidationException extends RuntimeException {
    public AccessValidationException(String message) {
        super(message);
    }
}
