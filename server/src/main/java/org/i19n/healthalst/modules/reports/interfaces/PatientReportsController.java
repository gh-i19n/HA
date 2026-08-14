package org.i19n.healthalst.modules.reports.interfaces;

import java.util.List;
import java.util.UUID;
import org.i19n.healthalst.modules.access.application.AuthenticatedUser;
import org.i19n.healthalst.modules.reports.application.AppointmentService;
import org.i19n.healthalst.modules.reports.application.ReportService;
import org.i19n.healthalst.modules.reports.interfaces.dto.BookingResponse;
import org.i19n.healthalst.modules.reports.interfaces.dto.PageResponse;
import org.i19n.healthalst.modules.reports.interfaces.dto.ReportPreviewResponse;
import org.i19n.healthalst.modules.reports.interfaces.dto.ReportResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** HTTP adapter for the patient-owned results and appointment experience. */
@RestController
@RequestMapping(path = "/api/v1/patient")
public class PatientReportsController {

    private final ReportService reportService;
    private final AppointmentService appointmentService;

    public PatientReportsController(ReportService reportService, AppointmentService appointmentService) {
        this.reportService = reportService;
        this.appointmentService = appointmentService;
    }

    /** Returns available results owned by the patient, optionally filtered by laboratory. */
    @GetMapping("/reports")
    public PageResponse<ReportResponse> reports(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        return PageResponse.from(reportService.listPatientReports(user, organizationId, page, size));
    }

    /** Returns the patient's appointment status across every laboratory used. */
    @GetMapping("/bookings")
    public List<BookingResponse> bookings(@AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.listPatientBookings(user);
    }

    /** Streams one authorized PDF inline after ownership and visibility checks. */
    @GetMapping(path = {"/reports/{reportId}/content", "/reports/{reportId}/preview"})
    public ResponseEntity<byte[]> preview(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID reportId
    ) {
        return ReportContentResponse.inline(reportService.getPatientContent(user, reportId));
    }

    /** Returns the structured preview document for the patient viewer. */
    @GetMapping(path = "/reports/{reportId}/preview-content")
    public ReportPreviewResponse previewContent(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID reportId
    ) {
        return reportService.getPatientPreviewContent(user, reportId);
    }

    /** Downloads an authorized source or generated report format. */
    @GetMapping(path = "/reports/{reportId}/exports/{format}")
    public ResponseEntity<byte[]> export(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID reportId,
            @PathVariable String format
    ) {
        return ReportContentResponse.attachment(reportService.exportPatientReport(user, reportId, format));
    }
}
