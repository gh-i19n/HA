package org.i19n.healthalst.modules.reports.domain;

/** Lifecycle of a patient appointment request owned by a laboratory. */
public enum BookingStatus {
    REQUESTED,
    APPROVED,
    REJECTED,
    COMPLETED;

    public boolean isUploadEligible() {
        return this == APPROVED || this == COMPLETED;
    }
}
