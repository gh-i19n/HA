package org.i19n.healthalst.modules.access.infrastructure;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.UserRole;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.reports.application.port.BookingPort;
import org.i19n.healthalst.modules.reports.application.port.ReportPort;
import org.i19n.healthalst.modules.reports.domain.ReportStatus;
import org.i19n.healthalst.modules.reports.domain.model.Booking;
import org.i19n.healthalst.modules.reports.domain.model.Report;
import org.i19n.healthalst.modules.reports.domain.ReportTemplate;
import org.i19n.healthalst.modules.reports.domain.StructuredReportInput;
import org.i19n.healthalst.modules.access.domain.AccountStatus;
import org.i19n.healthalst.modules.access.domain.MembershipStatus;
import org.i19n.healthalst.modules.access.domain.OrganizationRole;
import org.i19n.healthalst.modules.access.domain.model.Organization;
import org.i19n.healthalst.modules.access.domain.model.OrganizationMembership;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationRepository;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationMembershipRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Seeds repeatable local accounts and booking/report records for a runnable MVP. */
@Component
@Profile({"local", "test"})
@RequiredArgsConstructor
public class InitialDataSeeder implements ApplicationRunner {

    private static final UUID STAFF_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID PATIENT_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private static final UUID SECOND_PATIENT_ID = UUID.fromString("00000000-0000-0000-0000-000000000003");
    private static final UUID CLINIC_ID = UUID.fromString("00000000-0000-0000-0000-000000000010");

    private final UserAccountPort userAccountPort;
    private final BookingPort bookingPort;
    private final ReportPort reportPort;
    private final PasswordEncoder passwordEncoder;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final ObjectMapper objectMapper;
    private final Clock clock = Clock.systemUTC();

    @Value("${healthalst.initial-accounts.staff-email:staff@healthalst.local}")
    private String staffEmail;

    @Value("${healthalst.initial-accounts.staff-password:healthalst-staff}")
    private String staffPassword;

    @Value("${healthalst.initial-accounts.patient-email:patient@healthalst.local}")
    private String patientEmail;

    @Value("${healthalst.initial-accounts.patient-password:healthalst-patient}")
    private String patientPassword;

    /** Creates local-only data once so the MVP can be exercised without external providers. */
    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        User staff = ensureUser(STAFF_ID, staffEmail, "Dr. Adaeze Nwosu", UserRole.STAFF, staffPassword);
        User patient = ensureUser(PATIENT_ID, patientEmail, "Amina Okafor", UserRole.PATIENT, patientPassword);
        User secondPatient = ensureUser(
                SECOND_PATIENT_ID,
                "patient.two@healthalst.local",
                "Kelechi Adeyemi",
                UserRole.PATIENT,
                patientPassword
        );
        Organization clinic = ensureClinic();
        ensureMembership(staff, clinic);
        seedBookings(patient, secondPatient, clinic);
    }

    /**
     * Inserts one account if its email is not already present.
     * Seeded demo accounts are marked as previously signed in so their known
     * passwords stay valid: the one-time credential rotation applies only to
     * patients provisioned through real bookings.
     */
    private User ensureUser(UUID id, String email, String displayName, UserRole role, String password) {
        User user = userAccountPort.findByEmailIgnoreCase(email).orElseGet(User::new);
        user.setId(id);
        user.setEmail(email);
        user.setDisplayName(displayName);
        user.setRole(role);
        user.setAccountStatus(AccountStatus.ACTIVE);
        if (user.getPasswordHash() == null) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }
        if (user.getLastLoginAt() == null) {
            user.setLastLoginAt(java.time.Instant.now(clock));
        }
        return userAccountPort.save(user);
    }

    /** Adds a representative workload, a few pending requests, and leaves every fifth result pending. */
    private void seedBookings(User patient, User secondPatient, Organization clinic) {
        if (!bookingPort.findRecentBookings(clinic.getId()).isEmpty()) {
            return;
        }
        seedPendingRequests(patient, secondPatient, clinic);

        for (int index = 1; index <= 500; index++) {
            Booking booking = new Booking();
            booking.setId(UUID.nameUUIDFromBytes(("booking-" + index).getBytes(StandardCharsets.UTF_8)));
            booking.setOrganization(clinic);
            User owner = index % 3 == 0 ? patient : secondPatient;
            booking.setPatientUserId(owner.getId());
            booking.setPatientName(owner.getDisplayName());
            booking.setExamType(index % 2 == 0 ? "Chest X-ray" : "Abdominal ultrasound");
            booking.setBookingDate(LocalDate.now(clock).minusDays(index % 180L));
            booking.setBookingStatus(org.i19n.healthalst.modules.reports.domain.BookingStatus.COMPLETED);
            Booking savedBooking = bookingPort.save(booking);

            Report report = new Report();
            report.setId(UUID.nameUUIDFromBytes(("report-" + index).getBytes(StandardCharsets.UTF_8)));
            report.setBooking(savedBooking);
            report.setFileName("imaging-report-" + String.format("%03d", index) + ".pdf");
            report.setContentType("application/pdf");
            byte[] content = samplePdfContent();
            report.setContent(content);
            report.setFileSize(content.length);
            report.setStatus(index % 5 == 0 ? ReportStatus.PENDING : ReportStatus.AVAILABLE);
            report.setUploadedAt(java.time.Instant.now(clock).minusSeconds(index * 60L));
            if (index == 1 || index == 2) {
                report.setTemplate(index == 1 ? ReportTemplate.CHEST_XRAY : ReportTemplate.MRI_BRAIN);
                report.setTemplateVersion(1);
                report.setStructuredContent(structuredContent(index));
            }
            reportPort.save(report);
        }
    }

    /** Seeds a few pending appointment requests so the approval journey is exercisable locally. */
    private void seedPendingRequests(User patient, User secondPatient, Organization clinic) {
        User[] owners = {patient, secondPatient, patient};
        String[] exams = {"Chest X-ray", "Abdominal ultrasound", "MRI Brain"};
        for (int index = 0; index < owners.length; index++) {
            Booking booking = new Booking();
            booking.setId(UUID.nameUUIDFromBytes(("pending-booking-" + index).getBytes(StandardCharsets.UTF_8)));
            booking.setOrganization(clinic);
            booking.setPatientUserId(owners[index].getId());
            booking.setPatientName(owners[index].getDisplayName());
            booking.setExamType(exams[index]);
            booking.setBookingDate(LocalDate.now(clock).plusDays(index + 2L));
            booking.setBookingStatus(org.i19n.healthalst.modules.reports.domain.BookingStatus.REQUESTED);
            bookingPort.save(booking);
        }
    }

    private Organization ensureClinic() {
        Organization organization = organizationRepository.findById(CLINIC_ID).orElseGet(Organization::new);
        organization.setId(CLINIC_ID);
        organization.setName("Lagos Imaging Centre");
        organization.setSlug("lagos-imaging-centre");
        organization.setEmail("hello@lagosimaging.local");
        organization.setPhone("+234 800 555 0142");
        organization.setLocation("Lagos Island, Lagos");
        organization.setAddress("12 Marina Road, Lagos Island, Lagos");
        return organizationRepository.save(organization);
    }

    private void ensureMembership(User staff, Organization clinic) {
        if (membershipRepository.existsByOrganizationIdAndUserId(clinic.getId(), staff.getId())) return;
        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(clinic);
        membership.setUser(staff);
        membership.setRole(OrganizationRole.OWNER);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);
    }

    private String structuredContent(int index) {
        StructuredReportInput content = index == 1
                ? new StructuredReportInput(
                        "Persistent cough; assess for focal air-space opacity.",
                        "PA and lateral chest radiographs.",
                        "No prior study available for comparison.",
                        "Cardiomediastinal silhouette is within normal limits. The lungs are clear. No pleural effusion or pneumothorax.",
                        "No acute cardiopulmonary abnormality.",
                        "Dr. Adaeze Nwosu", "Consultant Radiologist")
                : new StructuredReportInput(
                        "Intermittent headache; exclude intracranial structural abnormality.",
                        "Multiplanar multisequence MRI of the brain without intravenous contrast.",
                        "No prior MRI available for comparison.",
                        "Normal brain volume and signal. No restricted diffusion, mass effect, hydrocephalus, or extra-axial collection.",
                        "No acute intracranial abnormality on this non-contrast examination.",
                        "Dr. Adaeze Nwosu", "Consultant Radiologist");
        try {
            return objectMapper.writeValueAsString(content);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not create structured report seed data", exception);
        }
    }

    /** Supplies a small valid PDF so seeded patient downloads exercise the real file path. */
    private byte[] samplePdfContent() {
        String pdf = "%PDF-1.4\n"
                + "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
                + "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
                + "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
                + "4 0 obj\n<< /Length 47 >>\nstream\nBT /F1 18 Tf 72 720 Td (HealthAlst imaging report) Tj ET\nendstream\nendobj\n"
                + "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
                + "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000241 00000 n \n0000000347 00000 n \n"
                + "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n417\n%%EOF\n";
        return pdf.getBytes(StandardCharsets.US_ASCII);
    }
}
