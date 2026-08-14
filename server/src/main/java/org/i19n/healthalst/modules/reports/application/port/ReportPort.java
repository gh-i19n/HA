package org.i19n.healthalst.modules.reports.application.port;

import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.reports.domain.ReportListItem;
import org.i19n.healthalst.modules.reports.domain.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** Application-facing persistence contract for report lists and lifecycle transitions. */
public interface ReportPort {

    Page<ReportListItem> findStaffPage(UUID organizationId, Pageable pageable);

    Page<ReportListItem> findPatientPage(UUID patientUserId, UUID organizationId, Pageable pageable);

    Optional<Report> findById(UUID id);

    Optional<Report> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Optional<Report> findAvailableByIdAndPatient(UUID id, UUID patientUserId);

    Report save(Report report);
}
