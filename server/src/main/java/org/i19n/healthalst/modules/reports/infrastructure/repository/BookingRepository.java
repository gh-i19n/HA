package org.i19n.healthalst.modules.reports.infrastructure.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.reports.application.port.BookingPort;
import org.i19n.healthalst.modules.reports.domain.BookingStatus;
import org.i19n.healthalst.modules.reports.domain.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA adapter for persisted appointment records. */
public interface BookingRepository extends JpaRepository<Booking, UUID>, BookingPort {

    /** Returns a bounded, deterministic list for the staff appointment view. */
    @Override
    default List<Booking> findRecentBookings(UUID organizationId) {
        return findTop100ByOrganizationIdAndBookingStatusInOrderByBookingDateDescIdDesc(
                organizationId, List.of(BookingStatus.APPROVED, BookingStatus.COMPLETED));
    }

    /** Spring Data derives the bounded ordering query from the method name. */
    List<Booking> findTop100ByOrganizationIdAndBookingStatusInOrderByBookingDateDescIdDesc(
            UUID organizationId, Collection<BookingStatus> statuses);

    /** Returns pending approval requests, newest preferred date first. */
    @Override
    default List<Booking> findRequestedBookings(UUID organizationId) {
        return findTop100ByOrganizationIdAndBookingStatusOrderByCreatedAtAscIdAsc(
                organizationId, BookingStatus.REQUESTED);
    }

    /** Spring Data derives the pending-request query from the method name. */
    List<Booking> findTop100ByOrganizationIdAndBookingStatusOrderByCreatedAtAscIdAsc(
            UUID organizationId, BookingStatus status);

    /** Returns the appointments owned by one patient across all laboratories. */
    @Override
    default List<Booking> findPatientBookings(UUID patientUserId) {
        return findTop100ByPatientUserIdOrderByBookingDateDescIdDesc(patientUserId);
    }

    /** Spring Data derives the patient appointment query from the method name. */
    List<Booking> findTop100ByPatientUserIdOrderByBookingDateDescIdDesc(UUID patientUserId);

    @Override
    Optional<Booking> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
