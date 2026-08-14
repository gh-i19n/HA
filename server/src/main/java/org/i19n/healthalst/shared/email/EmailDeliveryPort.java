package org.i19n.healthalst.shared.email;

/** Hexagonal port that isolates outbound email delivery from application services. */
public interface EmailDeliveryPort {

    boolean available();

    default void validateConfiguration() {
        if (!available()) {
            throw new EmailDeliveryException(
                "Email delivery is not configured. Set EMAIL_PROVIDER=resend, RESEND_API_KEY, and EMAIL_FROM."
            );
        }
    }

    void sendHtml(EmailMessage message);
}
