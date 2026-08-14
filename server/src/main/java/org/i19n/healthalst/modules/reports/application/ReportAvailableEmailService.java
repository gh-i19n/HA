package org.i19n.healthalst.modules.reports.application;

import java.time.format.DateTimeFormatter;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.reports.domain.model.Booking;
import org.i19n.healthalst.modules.reports.domain.model.Report;
import org.i19n.healthalst.shared.HealthAlstProperties;
import org.i19n.healthalst.shared.email.EmailDeliveryPort;
import org.i19n.healthalst.shared.email.EmailMessage;
import org.i19n.healthalst.shared.email.HealthAlstEmailTemplateRenderer;
import org.springframework.stereotype.Service;

/**
 * Notifies a patient by email as soon as an imaging report is made available.
 * Before the patient's first sign-in the platform also includes the one-time
 * password; the password is never sent by the laboratory.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportAvailableEmailService {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH);

    private final EmailDeliveryPort emailDeliveryPort;
    private final UserAccountPort userAccountPort;
    private final HealthAlstProperties healthAlstProperties;

    public void sendReportAvailable(Report report, String oneTimePassword) {
        Booking booking = report.getBooking();
        if (booking == null || booking.getPatientUserId() == null) {
            return;
        }
        User patient = userAccountPort.findById(booking.getPatientUserId()).orElse(null);
        if (patient == null || patient.getEmail() == null || patient.getEmail().isBlank()) {
            return;
        }
        String resultsUrl = healthAlstProperties.appUrl() + "/results";
        if (!emailDeliveryPort.available()) {
            log.warn(
                "Report-available email delivery is not configured. Direct {} to the patient portal: {}",
                patient.getEmail(), resultsUrl
            );
            return;
        }
        try {
            String clinicName = booking.getOrganization() == null
                ? "the laboratory"
                : booking.getOrganization().getName();
            String examType = report.getTemplate() == null
                ? booking.getExamType()
                : report.getTemplate().examination();
            String serviceDate = booking.getBookingDate() == null
                ? ""
                : " on " + DATE.format(booking.getBookingDate());
            String credentials = oneTimePassword == null
                ? HealthAlstEmailTemplateRenderer.paragraph(
                    "Sign in with your email and password to view the report, preview its contents, "
                    + "and download your own copy."
                  )
                : HealthAlstEmailTemplateRenderer.paragraph(
                    "Your results portal is ready and one account works for every laboratory you use. "
                    + "Sign in with the email and one-time password below."
                  )
                  + HealthAlstEmailTemplateRenderer.paragraphHtml(
                    "Email: " + HealthAlstEmailTemplateRenderer.strong(patient.getEmail())
                        + "<br>Password: " + HealthAlstEmailTemplateRenderer.strong(oneTimePassword)
                  )
                  + HealthAlstEmailTemplateRenderer.paragraph(
                    "This password was issued once by HealthAlst. Change it after your first sign-in."
                  );
            String html = HealthAlstEmailTemplateRenderer.render(
                "Your imaging result is ready",
                patient.getDisplayName(),
                HealthAlstEmailTemplateRenderer.paragraphHtml(
                    HealthAlstEmailTemplateRenderer.strong(examType)
                        + " from " + HealthAlstEmailTemplateRenderer.strong(clinicName)
                        + serviceDate + " has been reviewed and is now available to you."
                ) + credentials,
                "View my result",
                resultsUrl,
                "Your report is confidential medical data. Only you can access it with your sign-in."
            );
            emailDeliveryPort.sendHtml(new EmailMessage(
                patient.getEmail(), "Your imaging result is ready — " + clinicName, html
            ));
        } catch (Exception exception) {
            log.warn("Failed to send report-available email to {}: {}", patient.getEmail(), exception.getMessage());
        }
    }
}
