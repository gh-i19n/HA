package org.i19n.healthalst.modules.reports.infrastructure.repository;

import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.reports.application.port.ReportPort;
import org.i19n.healthalst.modules.reports.domain.ReportStatus;
import org.i19n.healthalst.modules.reports.domain.ReportListItem;
import org.i19n.healthalst.modules.reports.domain.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Spring Data JPA adapter for report pagination and patient visibility filtering. */
public interface ReportRepository extends JpaRepository<Report, UUID>, ReportPort {

    /** Loads list metadata and booking data without lazy-loading one row at a time. */
    @Override
    @Query("""
            select new org.i19n.healthalst.modules.reports.domain.ReportListItem(
                r.id, b.id, b.patientUserId, b.patientName, b.examType, b.bookingDate,
                b.organization.id, b.organization.name,
                r.fileName, r.contentType, r.fileSize, r.status, r.uploadedAt,
                r.template)
            from Report r join r.booking b
            where b.organization.id = :organizationId
            """)
    Page<ReportListItem> findStaffPage(
            @Param("organizationId") UUID organizationId,
            Pageable pageable
    );

    /** Applies patient ownership and availability in the database before pagination. */
    @Override
    @Query("""
            select new org.i19n.healthalst.modules.reports.domain.ReportListItem(
                r.id, b.id, b.patientUserId, b.patientName, b.examType, b.bookingDate,
                b.organization.id, b.organization.name,
                r.fileName, r.contentType, r.fileSize, r.status, r.uploadedAt,
                r.template)
            from Report r join r.booking b
            where b.patientUserId = :patientUserId
              and r.status = org.i19n.healthalst.modules.reports.domain.ReportStatus.AVAILABLE
              and (:organizationId is null or b.organization.id = :organizationId)
            """)
    Page<ReportListItem> findPatientPage(
            @Param("patientUserId") UUID patientUserId,
            @Param("organizationId") UUID organizationId,
            Pageable pageable
    );

    /** Spring Data derives the direct-access ownership and lifecycle predicate. */
    @Override
    default Optional<Report> findAvailableByIdAndPatient(UUID id, UUID patientUserId) {
        return findByIdAndBookingPatientUserIdAndStatus(id, patientUserId, ReportStatus.AVAILABLE);
    }

    /** The entity query behind the patient content port keeps the state predicate server-side. */
    @EntityGraph(attributePaths = "booking")
    Optional<Report> findByIdAndBookingPatientUserIdAndStatus(
            UUID id,
            UUID patientUserId,
            ReportStatus status
    );

    @EntityGraph(attributePaths = {"booking", "booking.organization"})
    Optional<Report> findByIdAndBookingOrganizationId(UUID id, UUID organizationId);

    @Override
    default Optional<Report> findByIdAndOrganizationId(UUID id, UUID organizationId) {
        return findByIdAndBookingOrganizationId(id, organizationId);
    }
}
