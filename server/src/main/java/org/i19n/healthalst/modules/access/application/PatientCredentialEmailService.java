package org.i19n.healthalst.modules.access.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.shared.HealthAlstProperties;
import org.i19n.healthalst.shared.email.EmailDeliveryPort;
import org.i19n.healthalst.shared.email.EmailMessage;
import org.i19n.healthalst.shared.email.HealthAlstEmailTemplateRenderer;
import org.springframework.stereotype.Service;

/**
 * Platform-owned patient credential delivery: the portal link plus the
 * one-time password, sent only by HealthAlst, never by a laboratory.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatientCredentialEmailService {

    private final EmailDeliveryPort emailDeliveryPort;
    private final HealthAlstProperties healthAlstProperties;

    public void sendCredentials(User patient, String password) {
        if (patient == null || patient.getEmail() == null || patient.getEmail().isBlank() || password == null) {
            return;
        }
        String portalUrl = healthAlstProperties.appUrl() + "/";
        if (!emailDeliveryPort.available()) {
            log.warn(
                "Credential email delivery is not configured. Share the portal manually with {}: {}",
                patient.getEmail(), portalUrl
            );
            return;
        }
        try {
            String html = HealthAlstEmailTemplateRenderer.render(
                "Your HealthAlst sign-in details",
                patient.getDisplayName(),
                HealthAlstEmailTemplateRenderer.paragraph(
                    "Your results portal is ready. You can sign in with the email and one-time "
                    + "password below."
                ) + HealthAlstEmailTemplateRenderer.paragraphHtml(
                    "Email: " + HealthAlstEmailTemplateRenderer.strong(patient.getEmail())
                        + "<br>Password: " + HealthAlstEmailTemplateRenderer.strong(password)
                ) + HealthAlstEmailTemplateRenderer.paragraph(
                    "This password is issued once. Sign in as soon as possible so your results "
                    + "stay protected, and change it in account settings."
                ),
                "Open your portal",
                portalUrl,
                "This password was sent to you by HealthAlst. No laboratory ever sees or sends your sign-in credentials."
            );
            emailDeliveryPort.sendHtml(new EmailMessage(
                patient.getEmail(), "Your HealthAlst sign-in details", html
            ));
        } catch (Exception exception) {
            log.warn("Failed to send credential email to {}: {}", patient.getEmail(), exception.getMessage());
        }
    }
}
