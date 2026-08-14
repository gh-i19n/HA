package org.i19n.healthalst.shared.infrastructure.email;

import org.i19n.healthalst.shared.email.EmailDeliveryException;
import org.i19n.healthalst.shared.email.EmailDeliveryPort;
import org.i19n.healthalst.shared.email.EmailMessage;

/** Safe default for development and test runs where outbound email is not configured. */
public class NoopEmailDeliveryGateway implements EmailDeliveryPort {

    @Override
    public boolean available() {
        return false;
    }

    @Override
    public void sendHtml(EmailMessage message) {
        throw new EmailDeliveryException(
            "Email delivery is not configured. Set EMAIL_PROVIDER=resend, RESEND_API_KEY, and EMAIL_FROM."
        );
    }
}
