package org.i19n.healthalst.modules.reports;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;
import org.i19n.healthalst.modules.access.domain.AccountStatus;
import org.i19n.healthalst.modules.access.domain.MembershipStatus;
import org.i19n.healthalst.modules.access.domain.OrganizationRole;
import org.i19n.healthalst.modules.access.domain.UserRole;
import org.i19n.healthalst.modules.access.domain.model.Organization;
import org.i19n.healthalst.modules.access.domain.model.OrganizationMembership;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationMembershipRepository;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationRepository;
import org.i19n.healthalst.modules.access.infrastructure.repository.UserRepository;
import org.i19n.healthalst.modules.notifications.infrastructure.UserNotificationRepository;
import org.i19n.healthalst.modules.reports.domain.ReportStatus;
import org.i19n.healthalst.modules.reports.domain.model.Booking;
import org.i19n.healthalst.modules.reports.domain.model.Report;
import org.i19n.healthalst.modules.reports.infrastructure.repository.BookingRepository;
import org.i19n.healthalst.modules.reports.infrastructure.repository.ReportRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import jakarta.servlet.http.Cookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/** Verifies report authorization, tenant isolation, canonical rendering, and exports. */
@SpringBootTest
@AutoConfigureMockMvc
class ReportAuthorizationIntegrationTest {


    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private ReportRepository reportRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private OrganizationRepository organizationRepository;
    @Autowired private OrganizationMembershipRepository membershipRepository;
    @Autowired private UserNotificationRepository notificationRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private static UUID seedId(String name) {
        return UUID.nameUUIDFromBytes(("report-" + name).getBytes(StandardCharsets.UTF_8));
    }

    private Cookie login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        return result.getResponse().getCookie("healthalst_session");
    }

    @Test
    void staffListIsTenantScopedAndCarriesNoFileBytes() throws Exception {
        Cookie cookie = login("staff@healthalst.local", "healthalst-staff");
        mockMvc.perform(get("/api/v1/staff/reports").param("page", "0").param("size", "25").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(500))
                .andExpect(jsonPath("$.items.length()").value(25))
                .andExpect(jsonPath("$.items[0].fileName").isNotEmpty())
                .andExpect(jsonPath("$.items[0].content").doesNotExist())
                .andExpect(jsonPath("$.items[0].bytes").doesNotExist());
    }

    @Test
    void patientListHidesPendingAndOtherPatientsReports() throws Exception {
        Cookie cookie = login("patient@healthalst.local", "healthalst-patient");
        mockMvc.perform(get("/api/v1/patient/reports").param("page", "0").param("size", "50").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(50))
                .andExpect(jsonPath("$.items[?(@.status == 'PENDING')]").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(org.hamcrest.Matchers.lessThan(500)));
    }

    @Test
    void patientPreviewOfStructuredReportRendersCanonicalPdf() throws Exception {
        Cookie cookie = login("patient.two@healthalst.local", "healthalst-patient");
        UUID reportId = seedId("1");
        byte[] stored = ((org.springframework.data.repository.CrudRepository<org.i19n.healthalst.modules.reports.domain.model.Report, java.util.UUID>) reportRepository).findById(reportId).orElseThrow().getContent();

        MvcResult result = mockMvc.perform(get("/api/v1/patient/reports/{id}/content", reportId).cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"))
                .andReturn();
        byte[] preview = result.getResponse().getContentAsByteArray();
        assertThat(preview).startsWith("%PDF".getBytes(StandardCharsets.US_ASCII));
        assertThat(preview.length).isGreaterThan(stored.length);
        assertThat(preview).isNotEqualTo(stored);
    }

    @Test
    void staffPreviewOfStructuredReportRendersCanonicalPdf() throws Exception {
        Cookie cookie = login("staff@healthalst.local", "healthalst-staff");
        UUID reportId = seedId("2");
        byte[] stored = ((org.springframework.data.repository.CrudRepository<org.i19n.healthalst.modules.reports.domain.model.Report, java.util.UUID>) reportRepository).findById(reportId).orElseThrow().getContent();

        MvcResult result = mockMvc.perform(get("/api/v1/staff/reports/{id}/preview", reportId).cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"))
                .andReturn();
        byte[] preview = result.getResponse().getContentAsByteArray();
        assertThat(preview).startsWith("%PDF".getBytes(StandardCharsets.US_ASCII));
        assertThat(preview).isNotEqualTo(stored);
    }

    @Test
    void unstructuredUploadKeepsReturningOriginalContent() throws Exception {
        Cookie cookie = login("staff@healthalst.local", "healthalst-staff");
        UUID reportId = seedId("3");
        Report report = ((org.springframework.data.repository.CrudRepository<org.i19n.healthalst.modules.reports.domain.model.Report, java.util.UUID>) reportRepository).findById(reportId).orElseThrow();
        assertThat(report.getTemplate()).isNull();

        MvcResult result = mockMvc.perform(get("/api/v1/staff/reports/{id}/preview", reportId).cookie(cookie))
                .andExpect(status().isOk())
                .andReturn();
        assertThat(result.getResponse().getContentAsByteArray()).isEqualTo(report.getContent());
    }

    @Test
    void patientCanExportStructuredReportAsPdfAndDocx() throws Exception {
        Cookie cookie = login("patient.two@healthalst.local", "healthalst-patient");
        UUID reportId = seedId("1");

        mockMvc.perform(get("/api/v1/patient/reports/{id}/exports/pdf", reportId).cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")));

        MvcResult docx = mockMvc.perform(get("/api/v1/patient/reports/{id}/exports/docx", reportId).cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString(".docx")))
                .andReturn();
        assertThat(docx.getResponse().getContentAsByteArray().length).isGreaterThan(0);
    }

    @Test
    void docxExportIsRejectedForUnstructuredUploads() throws Exception {
        Cookie cookie = login("patient@healthalst.local", "healthalst-patient");
        mockMvc.perform(get("/api/v1/patient/reports/{id}/exports/docx", seedId("3")).cookie(cookie))
                .andExpect(status().isBadRequest());
    }

    @Test
    void patientCannotReadAnotherPatientsReport() throws Exception {
        Cookie cookie = login("patient@healthalst.local", "healthalst-patient");
        mockMvc.perform(get("/api/v1/patient/reports/{id}/content", seedId("1")).cookie(cookie))
                .andExpect(status().isNotFound());
    }

    @Test
    void pendingReportIsNotVisibleToItsOwnerPatient() throws Exception {
        Cookie cookie = login("patient@healthalst.local", "healthalst-patient");
        mockMvc.perform(get("/api/v1/patient/reports/{id}/content", seedId("15")).cookie(cookie))
                .andExpect(status().isNotFound());
    }

    @Test
    void staffWithoutLaboratoryMembershipIsRejectedFromTenantApis() throws Exception {
        String email = "unassigned.staff@healthalst.local";
        User unassigned = new User();
        unassigned.setDisplayName("Tunde Bakare");
        unassigned.setEmail(email);
        unassigned.setRole(UserRole.STAFF);
        unassigned.setAccountStatus(AccountStatus.ACTIVE);
        unassigned.setPasswordHash(passwordEncoder.encode("staff-password-1"));
        ((org.i19n.healthalst.modules.access.application.port.UserAccountPort) userRepository).save(unassigned);
        Cookie cookie = login(email, "staff-password-1");

        mockMvc.perform(get("/api/v1/staff/reports").cookie(cookie))
                .andExpect(status().isForbidden());
    }

    @Test
    void secondTenantCannotSeeOrOpenFirstTenantReports() throws Exception {
        User owner = new User();
        owner.setDisplayName("Ngozi Eze");
        owner.setEmail("owner.tenancy@healthalst.local");
        owner.setRole(UserRole.STAFF);
        owner.setAccountStatus(AccountStatus.ACTIVE);
        owner.setPasswordHash(passwordEncoder.encode("owner-password-1"));
        ((org.i19n.healthalst.modules.access.application.port.UserAccountPort) userRepository).save(owner);

        Organization clinic = new Organization();
        clinic.setName("Abuja Scan Hub");
        clinic.setSlug("abuja-scan-hub");
        clinic.setEmail("hello@abujascan.local");
        organizationRepository.save(clinic);

        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(clinic);
        membership.setUser(owner);
        membership.setRole(OrganizationRole.OWNER);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);

        Booking booking = new Booking();
        booking.setOrganization(clinic);
        booking.setPatientUserId(UUID.fromString("00000000-0000-0000-0000-000000000002"));
        booking.setPatientName("Amina Okafor");
        booking.setExamType("Chest X-ray");
        booking.setBookingDate(LocalDate.now().minusDays(1));
        booking.setBookingStatus(org.i19n.healthalst.modules.reports.domain.BookingStatus.COMPLETED);
        ((org.i19n.healthalst.modules.reports.application.port.BookingPort) bookingRepository).save(booking);

        Report report = new Report();
        report.setBooking(booking);
        report.setFileName("abuja-report.pdf");
        report.setContentType("application/pdf");
        byte[] content = "%PDF-1.4\nabuja sample".getBytes(StandardCharsets.US_ASCII);
        report.setContent(content);
        report.setFileSize(content.length);
        report.setStatus(ReportStatus.AVAILABLE);
        report.setUploadedAt(Instant.now());
        ((org.i19n.healthalst.modules.reports.application.port.ReportPort) reportRepository).save(report);

        Cookie ownerCookie = login("owner.tenancy@healthalst.local", "owner-password-1");
        mockMvc.perform(get("/api/v1/staff/reports").cookie(ownerCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));

        Cookie staffCookie = login("staff@healthalst.local", "healthalst-staff");
        mockMvc.perform(get("/api/v1/staff/reports/{id}/preview", report.getId()).cookie(staffCookie))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/staff/reports/{id}/preview", seedId("1")).cookie(ownerCookie))
                .andExpect(status().isNotFound());
    }

    @Test
    void publicationCreatesPatientNotificationAfterCommit() throws Exception {
        Cookie staffCookie = login("staff@healthalst.local", "healthalst-staff");
        UUID reportId = seedId("10");
        UUID patientId = UUID.fromString("00000000-0000-0000-0000-000000000003");

        mockMvc.perform(post("/api/v1/staff/reports/{id}/publish", reportId).cookie(staffCookie))
                .andExpect(status().isOk());

        boolean delivered = notificationRepository.findAll().stream()
                .anyMatch(notification -> "REPORT_AVAILABLE".equals(notification.getType())
                        && patientId.equals(notification.getRecipientId())
                        && reportId.equals(notification.getResourceId()));
        assertThat(delivered).isTrue();

        Cookie patientCookie = login("patient.two@healthalst.local", "healthalst-patient");
        MvcResult preview = mockMvc.perform(get("/api/v1/patient/reports/{id}/content", reportId).cookie(patientCookie))
                .andExpect(status().isOk())
                .andReturn();
        assertThat(preview.getResponse().getContentAsByteArray().length).isGreaterThan(0);
    }

    @Test
    void staffPreviewContentOfStructuredReportIsSectionedAndDetailed() throws Exception {
        Cookie cookie = login("staff@healthalst.local", "healthalst-staff");

        mockMvc.perform(get("/api/v1/staff/reports/{id}/preview-content", seedId("2")).cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clinicName").value("Lagos Imaging Centre"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"))
                .andExpect(jsonPath("$.extractedText").doesNotExist())
                .andExpect(jsonPath("$.facts[?(@.label == 'Reported by')].value").value("Dr. Adaeze Nwosu"))
                .andExpect(jsonPath("$.facts[?(@.label == 'Report date')].value").isNotEmpty())
                .andExpect(jsonPath("$.sections[?(@.heading == 'Clinical indication')].body").isNotEmpty())
                .andExpect(jsonPath("$.sections[?(@.heading == 'Findings')].body").isNotEmpty())
                .andExpect(jsonPath("$.sections[?(@.heading == 'Impression')].body").isNotEmpty());
    }

    @Test
    void patientPreviewContentOfUnstructuredReportReturnsExtractedText() throws Exception {
        Cookie cookie = login("patient@healthalst.local", "healthalst-patient");

        MvcResult result = mockMvc.perform(get("/api/v1/patient/reports/{id}/preview-content", seedId("3")).cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sections.length()").value(0))
                .andExpect(jsonPath("$.extractedText").isNotEmpty())
                .andExpect(jsonPath("$.status").value("AVAILABLE"))
                .andReturn();
        assertThat(result.getResponse().getContentAsString(StandardCharsets.UTF_8))
                .contains("HealthAlst imaging report");
    }

    @Test
    void patientCannotReadAnotherPatientsPreviewContent() throws Exception {
        Cookie cookie = login("patient@healthalst.local", "healthalst-patient");
        mockMvc.perform(get("/api/v1/patient/reports/{id}/preview-content", seedId("1")).cookie(cookie))
                .andExpect(status().isNotFound());
    }

    @Test
    void unassignedStaffIsRejectedFromPreviewContent() throws Exception {
        String email = "preview.denied@healthalst.local";
        User denied = new User();
        denied.setDisplayName("Denied Preview");
        denied.setEmail(email);
        denied.setRole(UserRole.STAFF);
        denied.setAccountStatus(AccountStatus.ACTIVE);
        denied.setPasswordHash(passwordEncoder.encode("staff-password-2"));
        ((org.i19n.healthalst.modules.access.application.port.UserAccountPort) userRepository).save(denied);
        Cookie cookie = login(email, "staff-password-2");

        mockMvc.perform(get("/api/v1/staff/reports/{id}/preview-content", seedId("1")).cookie(cookie))
                .andExpect(status().isForbidden());
    }
}
