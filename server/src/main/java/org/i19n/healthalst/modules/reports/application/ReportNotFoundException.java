package org.i19n.healthalst.modules.reports.application;

/** Represents a missing or intentionally hidden booking/report resource. */
public class ReportNotFoundException extends RuntimeException {

    public ReportNotFoundException(String message) {
        super(message);
    }
}
