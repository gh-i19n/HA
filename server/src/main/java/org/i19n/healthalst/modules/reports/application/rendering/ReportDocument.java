package org.i19n.healthalst.modules.reports.application.rendering;

import java.time.LocalDate;
import org.i19n.healthalst.modules.reports.domain.ReportTemplate;
import org.i19n.healthalst.modules.reports.domain.StructuredReportInput;

/** Renderer-neutral imaging document adapted from Eventorch's export sections model. */
public record ReportDocument(
        String clinicName,
        String clinicAddress,
        String patientName,
        String bookingReference,
        LocalDate examinationDate,
        LocalDate reportDate,
        ReportTemplate template,
        StructuredReportInput content
) {}
