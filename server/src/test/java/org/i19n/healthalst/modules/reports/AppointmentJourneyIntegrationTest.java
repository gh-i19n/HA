package org.i19n.healthalst.modules.reports;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.AccountStatus;
import org.i19n.healthalst.modules.access.domain.MembershipStatus;
import org.i19n.healthalst.modules.access.domain.OrganizationRole;
import org.i19n.healthalst.modules.access.domain.UserRole;
import org.i19n.healthalst.modules.access.domain.model.Organization;
import org.i19n.healthalst.modules.access.domain.model.OrganizationMembership;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationMembershipRepository;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationRepository;
import org.i19n.healthalst.modules.reports.domain.BookingStatus;
import org.i19n.healthalst.modules.reports.domain.model.Booking;
import org.i19n.healthalst.modules.reports.infrastructure.repository.BookingRepository;
import org.i19n.healthalst.modules.reports.infrastructure.repository.ReportRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/** Verifies the public booking journey, laboratory approval, and one-account patient provisioning. */
@SpringBootTest
@AutoConfigureMockMvc
class AppointmentJourneyIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private ReportRepository reportRepository;
    @Autowired private UserAccountPort userAccountPort;
    @Autowired private OrganizationRepository organizationRepository;
    @Autowired private OrganizationMembershipRepository membershipRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private Cookie login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        return result.getResponse().getCookie("healthalst_session");
    }

    @Test
    void registrationIsLaboratoryOnlyAndPatientStaffEndpointsAreRemoved() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register/patient")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "displayName", "Nobody", "email", "nobody@healthalst.local", "password", "password-123"))))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/v1/auth/register/staff")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "displayName", "Nobody", "email", "nobody@healthalst.local", "password", "password-123"))))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/v1/auth/register/laboratory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "ownerName", "Chiamaka Obi", "email", "obis.lab@healthalst.local",
                                "password", "password-123", "laboratoryName", "Obi Reference Lab",
                                "location", "Yaba, Lagos", "address", "20 Herbert Macaulay Way, Yaba"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STAFF"))
                .andExpect(jsonPath("$.organizationRole").value("OWNER"))
                .andExpect(jsonPath("$.organizationName").value("Obi Reference Lab"));
    }

    @Test
    void publicDirectoryListsRegisteredLaboratories() throws Exception {
        mockMvc.perform(get("/api/v1/public/laboratories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == 'Lagos Imaging Centre')].location")
                        .value("Lagos Island, Lagos"))
                .andExpect(jsonPath("$[?(@.name == 'Lagos Imaging Centre')].address").isNotEmpty());
    }

    @Test
    void publicBookingProvisionsOnePatientAccountAcrossLaboratories() throws Exception {
        String email = "journey.patient@healthalst.local";
        MvcResult first = mockMvc.perform(post("/api/v1/public/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "patientName", "Yetunde Ade", "patientEmail", email,
                                "laboratoryId", "00000000-0000-0000-0000-000000000010",
                                "examType", "Chest X-ray", "preferredDate", LocalDate.now().plusDays(3).toString()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REQUESTED"))
                .andReturn();
        UUID firstBookingId = UUID.fromString(
                objectMapper.readTree(first.getResponse().getContentAsString()).get("id").asText());

        MvcResult second = mockMvc.perform(post("/api/v1/public/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "patientName", "Yetunde Ade", "patientEmail", email,
                                "laboratoryId", "00000000-0000-0000-0000-000000000010",
                                "examType", "Abdominal ultrasound", "preferredDate", LocalDate.now().plusDays(5).toString()))))
                .andExpect(status().isCreated())
                .andReturn();

        assertThat(second.getResponse().getContentAsString()).isNotEqualTo(first.getResponse().getContentAsString());
        User patient = userAccountPort.findByEmailIgnoreCase(email).orElseThrow();
        assertThat(patient.getRole().name()).isEqualTo("PATIENT");
        assertThat(bookingRepository.findPatientBookings(patient.getId())).hasSize(2);
        assertThat(((org.i19n.healthalst.modules.reports.application.port.BookingPort) bookingRepository)
                .findById(firstBookingId).orElseThrow().getBookingStatus().name())
                .isEqualTo("REQUESTED");
    }

    @Test
    void unknownLaboratoryIsRejectedForPublicBooking() throws Exception {
        mockMvc.perform(post("/api/v1/public/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "patientName", "Yetunde Ade", "patientEmail", "unknown.lab@healthalst.local",
                                "laboratoryId", "99999999-9999-9999-9999-999999999999",
                                "examType", "Chest X-ray", "preferredDate", LocalDate.now().plusDays(3).toString()))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void laboratoryApprovesAndRejectsPendingRequests() throws Exception {
        Cookie staffCookie = login("staff@healthalst.local", "healthalst-staff");
        UUID requestedId = bookingRepository.findRequestedBookings(
                UUID.fromString("00000000-0000-0000-0000-000000000010")).get(0).getId();

        mockMvc.perform(get("/api/v1/staff/bookings").cookie(staffCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.status == 'REQUESTED')]").isNotEmpty());

        mockMvc.perform(post("/api/v1/staff/bookings/{id}/approve", requestedId).cookie(staffCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "scheduledTime", Instant.now().plusSeconds(86400).toString(),
                                "message", "Please arrive 15 minutes early."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.scheduledTime").isNotEmpty());

        UUID secondRequestedId = bookingRepository.findRequestedBookings(
                UUID.fromString("00000000-0000-0000-0000-000000000010")).get(0).getId();
        mockMvc.perform(post("/api/v1/staff/bookings/{id}/reject", secondRequestedId).cookie(staffCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "message", "We cannot offer this test at the moment."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void alreadyDecidedBookingCannotBeApprovedAgain() throws Exception {
        Cookie staffCookie = login("staff@healthalst.local", "healthalst-staff");
        UUID requestedId = bookingRepository.findRequestedBookings(
                UUID.fromString("00000000-0000-0000-0000-000000000010")).get(0).getId();

        mockMvc.perform(post("/api/v1/staff/bookings/{id}/approve", requestedId).cookie(staffCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "scheduledTime", Instant.now().plusSeconds(86400).toString()))))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/staff/bookings/{id}/approve", requestedId).cookie(staffCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "scheduledTime", Instant.now().plusSeconds(86400).toString()))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void patientSeesTheirAppointmentsAndReportsFilterableByLaboratory() throws Exception {
        Cookie cookie = login("patient.two@healthalst.local", "healthalst-patient");

        mockMvc.perform(get("/api/v1/patient/bookings").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isNotEmpty());

        mockMvc.perform(get("/api/v1/patient/reports").cookie(cookie)
                        .param("organizationId", "00000000-0000-0000-0000-000000000010"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].organizationName").value("Lagos Imaging Centre"));
    }

    @Test
    void staffCannotApproveAnotherLaboratorysBooking() throws Exception {
        Cookie staffCookie = login("staff@healthalst.local", "healthalst-staff");

        User otherOwner = new User();
        otherOwner.setDisplayName("Ngozi Eze");
        otherOwner.setEmail("owner.other@healthalst.local");
        otherOwner.setRole(UserRole.STAFF);
        otherOwner.setAccountStatus(AccountStatus.ACTIVE);
        otherOwner.setPasswordHash(passwordEncoder.encode("owner-password-1"));
        otherOwner.setLastLoginAt(Instant.now());
        otherOwner = userAccountPort.save(otherOwner);

        Organization other = new Organization();
        other.setName("Abuja Scan Hub");
        other.setSlug("abuja-scan-hub-2");
        other.setLocation("Wuse, Abuja");
        other = organizationRepository.save(other);
        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(other);
        membership.setUser(otherOwner);
        membership.setRole(OrganizationRole.OWNER);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);

        Booking foreign = new Booking();
        foreign.setOrganization(other);
        User foreignPatient = new User();
        foreignPatient.setDisplayName("Tunde Bakare");
        foreignPatient.setEmail("tunde.bakare@healthalst.local");
        foreignPatient.setRole(UserRole.PATIENT);
        foreignPatient.setAccountStatus(AccountStatus.ACTIVE);
        foreignPatient.setPasswordHash(passwordEncoder.encode("patient-password-4"));
        foreignPatient.setLastLoginAt(Instant.now());
        foreignPatient = userAccountPort.save(foreignPatient);
        foreign.setPatientUserId(foreignPatient.getId());
        foreign.setPatientName("Tunde Bakare");
        foreign.setExamType("MRI scan");
        foreign.setBookingDate(LocalDate.now().plusDays(2));
        foreign.setBookingStatus(BookingStatus.REQUESTED);
        foreign = ((org.i19n.healthalst.modules.reports.application.port.BookingPort) bookingRepository).save(foreign);

        Cookie otherCookie = login("owner.other@healthalst.local", "owner-password-1");
        mockMvc.perform(post("/api/v1/staff/bookings/{id}/approve", foreign.getId()).cookie(staffCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "scheduledTime", Instant.now().plusSeconds(86400).toString()))))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/v1/staff/bookings/{id}/approve", foreign.getId()).cookie(otherCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "scheduledTime", Instant.now().plusSeconds(86400).toString()))))
                .andExpect(status().isOk());
    }
}