package org.i19n.healthalst.modules.reports.application;

import java.util.UUID;
import org.i19n.healthalst.modules.reports.domain.ReportTemplate;
import org.i19n.healthalst.modules.reports.domain.StructuredReportInput;

/** Transport-neutral command for an imaging report created from a reusable template. */
public record CreateStructuredReportCommand(
        UUID bookingId,
        ReportTemplate template,
        StructuredReportInput content
) {}
