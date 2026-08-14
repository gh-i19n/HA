package org.i19n.healthalst.modules.reports.application;

/** Signals that the authenticated role cannot perform a report operation. */
public class ReportAuthorizationException extends RuntimeException {

    public ReportAuthorizationException(String message) {
        super(message);
    }
}
