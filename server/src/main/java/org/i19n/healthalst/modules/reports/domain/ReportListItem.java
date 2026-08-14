package org.i19n.healthalst.modules.reports.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Read model used by paginated lists so report bytes never load for a table row. */
public record ReportListItem(
        UUID id,
        UUID bookingId,
        UUID patientUserId,
        String patientName,
        String examType,
        LocalDate bookingDate,
        UUID organizationId,
        String organizationName,
        String fileName,
        String contentType,
        long fileSize,
        ReportStatus status,
        Instant uploadedAt,
        ReportTemplate template
) {}
