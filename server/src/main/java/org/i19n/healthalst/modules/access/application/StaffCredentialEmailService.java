package org.i19n.healthalst.modules.access.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.i19n.healthalst.modules.access.domain.OrganizationRole;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.shared.HealthAlstProperties;
import org.i19n.healthalst.shared.email.EmailDeliveryPort;
import org.i19n.healthalst.shared.email.EmailMessage;
import org.i19n.healthalst.shared.email.HealthAlstEmailTemplateRenderer;
import org.springframework.stereotype.Service;

/** Sends laboratory-created staff accounts their platform-issued credentials. */
@Service
@RequiredArgsConstructor
@Slf4j
public class StaffCredentialEmailService {

    private final EmailDeliveryPort emailDeliveryPort;
    private final HealthAlstProperties healthAlstProperties;

    public void sendCredentials(User staff, String password, String laboratoryName, OrganizationRole role) {
        if (staff == null || staff.getEmail() == null || staff.getEmail().isBlank() || password == null) {
            return;
        }
        String workspaceUrl = healthAlstProperties.appUrl() + "/";
        if (!emailDeliveryPort.available()) {
            log.warn(
                "Staff credential email delivery is not configured. Share the workspace manually with {}: {}",
                staff.getEmail(), workspaceUrl
            );
            return;
        }
        try {
            String roleLabel = role == null ? "laboratory team member"
                : role.name().toLowerCase().replace('_', ' ');
            String html = HealthAlstEmailTemplateRenderer.render(
                "Your HealthAlst workspace is ready",
                staff.getDisplayName(),
                HealthAlstEmailTemplateRenderer.paragraphHtml(
                    "You have been added to the " + HealthAlstEmailTemplateRenderer.strong(laboratoryName)
                        + " workspace as " + HealthAlstEmailTemplateRenderer.strong(roleLabel) + "."
                ) + HealthAlstEmailTemplateRenderer.paragraphHtml(
                    "Email: " + HealthAlstEmailTemplateRenderer.strong(staff.getEmail())
                        + "<br>Password: " + HealthAlstEmailTemplateRenderer.strong(password)
                ) + HealthAlstEmailTemplateRenderer.paragraph(
                    "Sign in to open the laboratory workspace, manage appointments, and prepare "
                    + "imaging reports. Change your password after your first sign-in."
                ),
                "Open laboratory workspace",
                workspaceUrl,
                "Your credentials were issued by HealthAlst. No laboratory administrator sees the password they created for you."
            );
            emailDeliveryPort.sendHtml(new EmailMessage(
                staff.getEmail(), "You were added to " + laboratoryName + " on HealthAlst", html
            ));
        } catch (Exception exception) {
            log.warn("Failed to send staff credential email to {}: {}", staff.getEmail(), exception.getMessage());
        }
    }
}
