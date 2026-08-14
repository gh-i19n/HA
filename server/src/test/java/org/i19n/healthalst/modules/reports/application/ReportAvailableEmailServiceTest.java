package org.i19n.healthalst.modules.reports.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.model.Organization;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.reports.domain.ReportStatus;
import org.i19n.healthalst.modules.reports.domain.ReportTemplate;
import org.i19n.healthalst.modules.reports.domain.model.Booking;
import org.i19n.healthalst.modules.reports.domain.model.Report;
import org.i19n.healthalst.shared.HealthAlstProperties;
import org.i19n.healthalst.shared.email.EmailDeliveryPort;
import org.i19n.healthalst.shared.email.EmailMessage;
import org.junit.jupiter.api.Test;

/** Verifies the report-available email names the exam, laboratory, patient, and credentials. */
class ReportAvailableEmailServiceTest {

    private static final UUID PATIENT_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    private static final HealthAlstProperties PROPERTIES = new HealthAlstProperties("http://localhost:3003", null);

    @Test
    void reportAvailableEmailNamesExamLaboratoryAndPatient() {
        StubEmailPort port = new StubEmailPort(true);
        ReportAvailableEmailService service = new ReportAvailableEmailService(port, new StubUserPort("Amina Okafor", "amina@example.com"), PROPERTIES);
        service.sendReportAvailable(report(ReportTemplate.CHEST_XRAY), null);

        assertThat(port.messages).hasSize(1);
        EmailMessage message = port.messages.get(0);
        assertThat(message.to()).isEqualTo("amina@example.com");
        assertThat(message.subject()).contains("Your imaging result is ready").contains("Lagos Imaging Centre");
        assertThat(message.html())
                .contains("Chest radiograph")
                .contains("Lagos Imaging Centre")
                .contains("View my result")
                .contains("Amina Okafor");
    }

    @Test
    void firstTimeCredentialsIncludeTheOneTimePassword() {
        StubEmailPort port = new StubEmailPort(true);
        ReportAvailableEmailService service = new ReportAvailableEmailService(port, new StubUserPort("Amina Okafor", "amina@example.com"), PROPERTIES);
        service.sendReportAvailable(report(ReportTemplate.CHEST_XRAY), "S3cret-9X!pass");

        assertThat(port.messages).hasSize(1);
        String html = port.messages.get(0).html();
        assertThat(html).contains("S3cret-9X!pass").contains("amina@example.com");
    }

    @Test
    void returningPatientEmailOmitsThePassword() {
        StubEmailPort port = new StubEmailPort(true);
        ReportAvailableEmailService service = new ReportAvailableEmailService(port, new StubUserPort("Amina Okafor", "amina@example.com"), PROPERTIES);
        service.sendReportAvailable(report(ReportTemplate.CHEST_XRAY), null);

        assertThat(port.messages).hasSize(1);
        assertThat(port.messages.get(0).html()).doesNotContain("one-time password");
    }

    @Test
    void unstructuredReportFallsBackToBookingExamType() {
        StubEmailPort port = new StubEmailPort(true);
        ReportAvailableEmailService service = new ReportAvailableEmailService(port, new StubUserPort("Amina Okafor", "amina@example.com"), PROPERTIES);
        service.sendReportAvailable(report(null), null);

        assertThat(port.messages).hasSize(1);
        assertThat(port.messages.get(0).html()).contains("Chest X-ray");
    }

    @Test
    void reportAvailableEmailSkipsWhenDeliveryIsNotConfigured() {
        StubEmailPort port = new StubEmailPort(false);
        ReportAvailableEmailService service = new ReportAvailableEmailService(port, new StubUserPort("Amina Okafor", "amina@example.com"), PROPERTIES);

        assertThatCode(() -> service.sendReportAvailable(report(ReportTemplate.CHEST_XRAY), null))
                .doesNotThrowAnyException();
        assertThat(port.messages).isEmpty();
    }

    @Test
    void reportAvailableEmailSkipsWhenPatientHasNoAddress() {
        StubEmailPort port = new StubEmailPort(true);
        ReportAvailableEmailService service = new ReportAvailableEmailService(port, new StubUserPort("Amina Okafor", null), PROPERTIES);
        service.sendReportAvailable(report(ReportTemplate.CHEST_XRAY), null);

        assertThat(port.messages).isEmpty();
    }

    private static Report report(ReportTemplate template) {
        Organization organization = new Organization();
        organization.setName("Lagos Imaging Centre");
        Booking booking = new Booking();
        booking.setId(UUID.fromString("00000000-0000-0000-0000-000000000099"));
        booking.setOrganization(organization);
        booking.setPatientUserId(PATIENT_ID);
        booking.setPatientName("Amina Okafor");
        booking.setExamType("Chest X-ray");
        booking.setBookingDate(LocalDate.of(2026, 8, 13));
        Report report = new Report();
        report.setBooking(booking);
        report.setTemplate(template);
        report.setStatus(ReportStatus.AVAILABLE);
        report.setUploadedAt(Instant.parse("2026-08-14T07:00:00Z"));
        return report;
    }

    private static final class StubEmailPort implements EmailDeliveryPort {
        private final boolean available;
        private final List<EmailMessage> messages = new ArrayList<>();

        private StubEmailPort(boolean available) {
            this.available = available;
        }

        @Override
        public boolean available() {
            return available;
        }

        @Override
        public void sendHtml(EmailMessage message) {
            messages.add(message);
        }
    }

    private static final class StubUserPort implements UserAccountPort {
        private final User user = new User();

        private StubUserPort(String displayName, String email) {
            user.setDisplayName(displayName);
            user.setEmail(email);
        }

        @Override
        public Optional<User> findById(UUID id) {
            return id.equals(PATIENT_ID) ? Optional.of(user) : Optional.empty();
        }

        @Override
        public Optional<User> findByEmailIgnoreCase(String email) {
            return Optional.of(user);
        }

        @Override
        public boolean existsByEmailIgnoreCase(String email) {
            return true;
        }

        @Override
        public User save(User value) {
            return value;
        }
    }
}