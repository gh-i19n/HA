package org.i19n.healthalst.modules.access.domain;

/** Clinic-scoped roles adapted from Eventorch's organization membership model. */
public enum OrganizationRole {
    OWNER,
    ADMIN,
    REPORT_STAFF;

    public boolean canManageOrganization() {
        return this == OWNER || this == ADMIN;
    }

    public boolean canManageReports() {
        return this == OWNER || this == REPORT_STAFF;
    }
}
