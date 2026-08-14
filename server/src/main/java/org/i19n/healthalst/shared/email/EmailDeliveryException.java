package org.i19n.healthalst.shared.email;

/** Raised when the configured email provider rejects or cannot reach a message. */
public class EmailDeliveryException extends RuntimeException {

    public EmailDeliveryException(String message) {
        super(message);
    }

    public EmailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
