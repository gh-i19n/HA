package org.i19n.healthalst.modules.reports.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.AuthenticatedUser;
import org.i19n.healthalst.modules.access.application.PatientProvisioningService;
import org.i19n.healthalst.modules.access.application.port.OrganizationDirectoryPort;
import org.i19n.healthalst.modules.access.application.port.UserAccountPort;
import org.i19n.healthalst.modules.access.domain.model.User;
import org.i19n.healthalst.modules.access.infrastructure.repository.OrganizationRepository;
import org.i19n.healthalst.modules.reports.application.port.BookingPort;
import org.i19n.healthalst.modules.reports.domain.BookingStatus;
import org.i19n.healthalst.modules.reports.domain.model.Booking;
import org.i19n.healthalst.modules.reports.interfaces.dto.BookingResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Owns the public booking journey and the laboratory approval workflow. */
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final BookingPort bookingPort;
    private final OrganizationDirectoryPort organizationDirectoryPort;
    private final OrganizationRepository organizationRepository;
    private final UserAccountPort userAccountPort;
    private final PatientProvisioningService patientProvisioningService;
    private final AppointmentEmailService appointmentEmailService;

    /** Returns every registered laboratory for the public booking dropdown. */
    @Transactional(readOnly = true)
    public List<OrganizationDirectoryPort.LaboratoryDirectoryEntry> listPublicLaboratories() {
        return organizationDirectoryPort.listRegistered();
    }

    /**
     * Creates a booking request for a patient who may not have an account yet.
     * The platform provisions the single patient account; credentials are
     * emailed later with the first available report, never here.
     */
    @Transactional
    public BookingResponse createAppointment(CreateAppointmentCommand command) {
        validate(command);
        var laboratory = organizationRepository.findById(command.laboratoryId())
                .orElseThrow(() -> new ReportValidationException("Choose a registered laboratory."));
        var patient = patientProvisioningService.provision(command.patientEmail(), command.patientName()).user();

        Booking booking = new Booking();
        booking.setOrganization(laboratory);
        booking.setPatientUserId(patient.getId());
        booking.setPatientName(patient.getDisplayName());
        booking.setExamType(command.examType().trim());
        booking.setBookingDate(command.preferredDate());
        booking.setBookingStatus(BookingStatus.REQUESTED);
        booking = bookingPort.save(booking);

        appointmentEmailService.sendRequestConfirmation(booking, patient);
        return BookingResponse.from(booking, patient.getEmail());
    }

    /** Returns the laboratory's appointments; pending requests come first. */
    @Transactional(readOnly = true)
    public List<BookingResponse> listLaboratoryBookings(AuthenticatedUser user) {
        requireStaff(user);
        List<Booking> requests = bookingPort.findRequestedBookings(user.organizationId());
        List<Booking> rest = bookingPort.findRecentBookings(user.organizationId());
        List<Booking> bookings = new java.util.ArrayList<>(requests);
        bookings.addAll(rest);
        return bookings.stream()
                .map(booking -> BookingResponse.from(booking, patientEmail(booking)))
                .toList();
    }

    /** Approves a request and emails the patient the show-up time. */
    @Transactional
    public BookingResponse approve(AuthenticatedUser user, UUID bookingId, Instant scheduledTime, String message) {
        requireStaff(user);
        Booking booking = bookingPort.findByIdAndOrganizationId(bookingId, user.organizationId())
                .orElseThrow(() -> new ReportNotFoundException("The appointment was not found."));
        if (booking.getBookingStatus() != BookingStatus.REQUESTED) {
            throw new ReportValidationException("Only pending requests can be approved.");
        }
        booking.setBookingStatus(BookingStatus.APPROVED);
        booking.setScheduledTime(scheduledTime);
        booking = bookingPort.save(booking);
        appointmentEmailService.sendApproved(booking, patient(booking), message);
        return BookingResponse.from(booking, patientEmail(booking));
    }

    /** Rejects a request and emails the patient a reason. */
    @Transactional
    public BookingResponse reject(AuthenticatedUser user, UUID bookingId, String message) {
        requireStaff(user);
        Booking booking = bookingPort.findByIdAndOrganizationId(bookingId, user.organizationId())
                .orElseThrow(() -> new ReportNotFoundException("The appointment was not found."));
        if (booking.getBookingStatus() != BookingStatus.REQUESTED) {
            throw new ReportValidationException("Only pending requests can be rejected.");
        }
        booking.setBookingStatus(BookingStatus.REJECTED);
        booking = bookingPort.save(booking);
        appointmentEmailService.sendRejected(booking, patient(booking), message);
        return BookingResponse.from(booking, patientEmail(booking));
    }

    /** Returns one patient's appointments across every laboratory they used. */
    @Transactional(readOnly = true)
    public List<BookingResponse> listPatientBookings(AuthenticatedUser user) {
        requirePatient(user);
        return bookingPort.findPatientBookings(user.id()).stream()
                .map(booking -> BookingResponse.from(booking, user.email()))
                .toList();
    }

    private User patient(Booking booking) {
        return userAccountPort.findById(booking.getPatientUserId())
                .orElseThrow(() -> new ReportNotFoundException("The patient account was not found."));
    }

    private String patientEmail(Booking booking) {
        return userAccountPort.findById(booking.getPatientUserId())
                .map(User::getEmail)
                .orElse(null);
    }

    private void validate(CreateAppointmentCommand command) {
        if (command == null || command.laboratoryId() == null) {
            throw new ReportValidationException("Choose a laboratory.");
        }
        if (command.patientEmail() == null || command.patientEmail().isBlank()
                || !command.patientEmail().contains("@")) {
            throw new ReportValidationException("A valid patient email is required.");
        }
        if (command.patientName() == null || command.patientName().isBlank()) {
            throw new ReportValidationException("The patient name is required.");
        }
        if (command.examType() == null || command.examType().isBlank()) {
            throw new ReportValidationException("The test or checkup type is required.");
        }
        if (command.preferredDate() == null || command.preferredDate().isBefore(LocalDate.now())) {
            throw new ReportValidationException("Choose a preferred date in the future.");
        }
    }

    private void requireStaff(AuthenticatedUser user) {
        if (user == null || !user.canManageReports()) {
            throw new ReportAuthorizationException("Staff access is required.");
        }
    }

    private void requirePatient(AuthenticatedUser user) {
        if (user == null || !user.isPatient()) {
            throw new ReportAuthorizationException("Patient access is required.");
        }
    }

    public record CreateAppointmentCommand(
            String patientName,
            String patientEmail,
            UUID laboratoryId,
            String examType,
            LocalDate preferredDate
    ) {}
}
