package org.i19n.healthalst.modules.reports.interfaces.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.i19n.healthalst.modules.reports.domain.ReportListItem;
import org.i19n.healthalst.modules.reports.domain.model.Report;

/** Stable report metadata returned to staff and patient list views. */
public record ReportResponse(
        UUID id,
        UUID bookingId,
        UUID patientId,
        String patientName,
        String examType,
        LocalDate bookingDate,
        UUID organizationId,
        String organizationName,
        String fileName,
        String contentType,
        long fileSize,
        String status,
        Instant uploadedAt,
        String templateKey,
        java.util.List<String> exportFormats
) {

    /** Maps the lightweight JPA projection used by paginated list queries. */
    public static ReportResponse from(ReportListItem report) {
        return new ReportResponse(
                report.id(), report.bookingId(), report.patientUserId(), report.patientName(),
                report.examType(), report.bookingDate(), report.organizationId(), report.organizationName(),
                report.fileName(), report.contentType(), report.fileSize(), report.status().name(),
                report.uploadedAt(), report.template() == null ? null : report.template().name(),
                report.template() == null ? java.util.List.of("PDF") : java.util.List.of("PDF", "DOCX")
        );
    }

    /** Maps a newly uploaded or published entity without exposing its content bytes. */
    public static ReportResponse from(Report report) {
        return new ReportResponse(
                report.getId(), report.getBooking().getId(), report.getBooking().getPatientUserId(),
                report.getBooking().getPatientName(), report.getBooking().getExamType(),
                report.getBooking().getBookingDate(), report.getBooking().getOrganization().getId(),
                report.getBooking().getOrganization().getName(), report.getFileName(),
                report.getContentType(), report.getFileSize(), report.getStatus().name(),
                report.getUploadedAt(), report.getTemplate() == null ? null : report.getTemplate().name(),
                report.getTemplate() == null ? java.util.List.of("PDF") : java.util.List.of("PDF", "DOCX")
        );
    }
}
