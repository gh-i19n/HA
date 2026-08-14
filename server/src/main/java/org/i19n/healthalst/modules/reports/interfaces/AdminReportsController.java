package org.i19n.healthalst.modules.reports.interfaces;

import java.util.List;
import java.util.UUID;
import org.i19n.healthalst.modules.access.application.AuthenticatedUser;
import org.i19n.healthalst.modules.reports.application.AppointmentService;
import org.i19n.healthalst.modules.reports.application.ReportService;
import org.i19n.healthalst.modules.reports.application.CreateStructuredReportCommand;
import org.i19n.healthalst.modules.reports.domain.ReportTemplate;
import org.i19n.healthalst.modules.reports.domain.StructuredReportInput;
import org.i19n.healthalst.modules.reports.interfaces.dto.BookingResponse;
import org.i19n.healthalst.modules.reports.interfaces.dto.PageResponse;
import org.i19n.healthalst.modules.reports.interfaces.dto.ReportPreviewResponse;
import org.i19n.healthalst.modules.reports.interfaces.dto.ReportResponse;
import org.i19n.healthalst.modules.reports.interfaces.dto.UploadReportRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** HTTP adapter for staff report queue, booking selection, upload, and publication. */
@RestController
@RequestMapping(path = "/api/v1/staff")
public class AdminReportsController {

    private final ReportService reportService;
    private final AppointmentService appointmentService;

    public AdminReportsController(ReportService reportService, AppointmentService appointmentService) {
        this.reportService = reportService;
        this.appointmentService = appointmentService;
    }

    /** Returns one bounded staff page of report metadata. */
    @GetMapping("/reports")
    public PageResponse<ReportResponse> reports(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        return PageResponse.from(reportService.listStaffReports(user, page, size));
    }

    /** Returns the laboratory's appointments with pending requests first. */
    @GetMapping("/bookings")
    public List<BookingResponse> bookings(@AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.listLaboratoryBookings(user);
    }

    /** Approves a pending request and emails the patient the show-up time. */
    @PostMapping("/bookings/{bookingId}/approve")
    public BookingResponse approve(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID bookingId,
            @RequestBody ApproveBookingRequest request
    ) {
        return appointmentService.approve(user, bookingId, request.scheduledTime(), request.message());
    }

    /** Rejects a pending request and emails the patient the reason. */
    @PostMapping("/bookings/{bookingId}/reject")
    public BookingResponse reject(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID bookingId,
            @RequestBody RejectBookingRequest request
    ) {
        return appointmentService.reject(user, bookingId, request.message());
    }

    /** Stores an uploaded PDF as pending until staff explicitly publishes it. */
    @PostMapping(path = "/reports", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReportResponse> upload(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam UUID bookingId,
            @RequestPart MultipartFile file
    ) {
        ReportResponse response = reportService.upload(
                user, new UploadReportRequest(bookingId, file).toCommand());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Makes one pending report visible to its patient. */
    @PostMapping("/reports/{reportId}/publish")
    public ReportResponse publish(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID reportId
    ) {
        return reportService.publish(user, reportId);
    }

    /** Returns the reusable structured imaging report templates. */
    @GetMapping("/report-templates")
    public List<TemplateResponse> templates(@AuthenticationPrincipal AuthenticatedUser user) {
        reportService.listBookings(user);
        return java.util.Arrays.stream(ReportTemplate.values()).map(TemplateResponse::from).toList();
    }

    /** Creates a pending report from the selected canonical template. */
    @PostMapping(path = "/reports/structured", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ReportResponse> createStructured(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody StructuredReportRequest request
    ) {
        var report = reportService.createStructured(user, new CreateStructuredReportCommand(
                request.bookingId(), request.template(), request.content()));
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    /** Streams a tenant-authorized pending or available PDF inline for review. */
    @GetMapping(path = "/reports/{reportId}/preview")
    public ResponseEntity<byte[]> preview(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID reportId
    ) {
        return ReportContentResponse.inline(reportService.getStaffContent(user, reportId));
    }

    /** Returns the structured preview document for the staff viewer. */
    @GetMapping(path = "/reports/{reportId}/preview-content")
    public ReportPreviewResponse previewContent(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID reportId
    ) {
        return reportService.getStaffPreviewContent(user, reportId);
    }

    /** Downloads a tenant-authorized report rendition. */
    @GetMapping(path = "/reports/{reportId}/exports/{format}")
    public ResponseEntity<byte[]> export(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID reportId,
            @PathVariable String format
    ) {
        return ReportContentResponse.attachment(reportService.exportStaffReport(user, reportId, format));
    }

    public record StructuredReportRequest(UUID bookingId, ReportTemplate template, StructuredReportInput content) {}
    public record ApproveBookingRequest(java.time.Instant scheduledTime, String message) {}
    public record RejectBookingRequest(String message) {}
    public record TemplateResponse(String key, String title, String examination, int version) {
        static TemplateResponse from(ReportTemplate template) {
            return new TemplateResponse(template.name(), template.title(), template.examination(), 1);
        }
    }
}
