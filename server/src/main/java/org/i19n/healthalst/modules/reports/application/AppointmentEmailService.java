package org.i19n.healthalst.modules.reports.application;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.reports.domain.model.Booking;
import org.i19n.healthalst.shared.HealthAlstProperties;
import org.i19n.healthalst.shared.email.EmailDeliveryPort;
import org.i19n.healthalst.shared.email.EmailMessage;
import org.i19n.healthalst.shared.email.HealthAlstEmailTemplateRenderer;
import org.springframework.stereotype.Service;

/** Emails every patient feedback step of the appointment journey. */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentEmailService {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("h:mma", Locale.ENGLISH);

    private final EmailDeliveryPort emailDeliveryPort;
    private final HealthAlstProperties healthAlstProperties;

    /** Acknowledges the public booking request with what happens next. */
    public void sendRequestConfirmation(Booking booking, User patient) {
        send(patient, "Your appointment request was received",
            "Your " + strong(booking.getExamType()) + " appointment request with "
                + strong(booking.getOrganization().getName()) + " was received"
                + dateSuffix(booking) + ".",
            "The laboratory will review your request and email you the time to show up. "
                + "You do not need an account to receive updates.",
            "Keep an eye on your inbox for the laboratory's confirmation.");
    }

    /** Tells the patient when to show up after laboratory approval. */
    public void sendApproved(Booking booking, User patient, String message) {
        String schedule = booking.getScheduledTime() == null
            ? "on " + DATE.format(booking.getBookingDate())
            : "at " + TIME.format(booking.getScheduledTime().atZone(ZoneOffset.UTC))
                + " on " + DATE.format(booking.getScheduledTime().atZone(ZoneOffset.UTC));
        send(patient, "Your appointment is confirmed",
            "Your " + strong(booking.getExamType()) + " appointment with "
                + strong(booking.getOrganization().getName()) + " is confirmed "
                + strong(schedule) + ".",
            "Please arrive on time and bring any referral or identification requested by the laboratory."
                + message(booking.getOrganization().getName(), message),
            "Questions? Contact the laboratory directly.");
    }

    /** Explains a rejected request without clinical detail. */
    public void sendRejected(Booking booking, User patient, String message) {
        send(patient, "Your appointment request was not accepted",
            "Your " + strong(booking.getExamType()) + " appointment request with "
                + strong(booking.getOrganization().getName()) + " was not accepted.",
            "Contact the laboratory directly if you would like to discuss it or book a new appointment."
                + message(booking.getOrganization().getName(), message),
            "You can book again with any registered laboratory.");
    }

    private String dateSuffix(Booking booking) {
        return booking.getBookingDate() == null
            ? ""
            : " for " + DATE.format(booking.getBookingDate());
    }

    private String message(String laboratoryName, String message) {
        if (message == null || message.isBlank()) {
            return "";
        }
        return "<br><br>" + HealthAlstEmailTemplateRenderer.esc(laboratoryName)
            + " wrote: " + HealthAlstEmailTemplateRenderer.esc(message);
    }

    private void send(User patient, String title, String lead, String body, String footer) {
        if (patient == null || patient.getEmail() == null || patient.getEmail().isBlank()) {
            return;
        }
        if (!emailDeliveryPort.available()) {
            log.warn("Appointment email delivery is not configured. Direct {} to the portal.", patient.getEmail());
            return;
        }
        try {
            String html = HealthAlstEmailTemplateRenderer.render(
                title,
                patient.getDisplayName(),
                HealthAlstEmailTemplateRenderer.paragraphHtml(lead)
                    + HealthAlstEmailTemplateRenderer.paragraph(body),
                "Open HealthAlst",
                healthAlstProperties.appUrl() + "/",
                footer
            );
            emailDeliveryPort.sendHtml(new EmailMessage(patient.getEmail(), title + " — HealthAlst", html));
        } catch (Exception exception) {
            log.warn("Failed to send appointment email to {}: {}", patient.getEmail(), exception.getMessage());
        }
    }

    private String strong(String value) {
        return HealthAlstEmailTemplateRenderer.strong(value);
    }
}
