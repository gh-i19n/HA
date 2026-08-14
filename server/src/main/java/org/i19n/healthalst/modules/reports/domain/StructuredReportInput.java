package org.i19n.healthalst.modules.reports.domain;

/** Canonical, versioned clinical document fields shared by the two first templates. */
public record StructuredReportInput(
        String clinicalIndication,
        String technique,
        String comparison,
        String findings,
        String impression,
        String reportingProfessional,
        String professionalTitle
) {}
