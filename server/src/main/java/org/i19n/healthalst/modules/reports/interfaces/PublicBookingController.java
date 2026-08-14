package org.i19n.healthalst.modules.reports.interfaces;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.i19n.healthalst.modules.access.application.port.OrganizationDirectoryPort;
import org.i19n.healthalst.modules.reports.application.AppointmentService;
import org.i19n.healthalst.modules.reports.interfaces.dto.BookingResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public booking surface: laboratory directory and appointment requests, no account required. */
@RestController
@RequestMapping(path = "/api/v1/public")
public class PublicBookingController {

    private final AppointmentService appointmentService;

    public PublicBookingController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    /** Lists every registered laboratory for the patient's booking dropdown. */
    @GetMapping("/laboratories")
    public List<OrganizationDirectoryPort.LaboratoryDirectoryEntry> laboratories() {
        return appointmentService.listPublicLaboratories();
    }

    /** Creates a request and provisions the patient account platform-side. */
    @PostMapping("/appointments")
    public ResponseEntity<BookingResponse> createAppointment(@RequestBody AppointmentRequest request) {
        BookingResponse response = appointmentService.createAppointment(
                new AppointmentService.CreateAppointmentCommand(
                        request.patientName(), request.patientEmail(), request.laboratoryId(),
                        request.examType(), request.preferredDate()));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    public record AppointmentRequest(
            String patientName, String patientEmail, UUID laboratoryId, String examType, LocalDate preferredDate) {}
}
