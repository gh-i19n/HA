package org.i19n.healthalst.modules.reports.application;

/** Represents invalid report input at the application boundary. */
public class ReportValidationException extends RuntimeException {

    public ReportValidationException(String message) {
        super(message);
    }
}
