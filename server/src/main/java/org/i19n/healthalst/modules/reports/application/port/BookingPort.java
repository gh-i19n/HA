package org.i19n.healthalst.modules.reports.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.i19n.healthalst.modules.reports.domain.BookingStatus;
import org.i19n.healthalst.modules.reports.domain.model.Booking;

/** Application-facing persistence contract for appointment lifecycle support. */
public interface BookingPort {

    Optional<Booking> findById(UUID id);

    Optional<Booking> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<Booking> findRecentBookings(UUID organizationId);

    List<Booking> findRequestedBookings(UUID organizationId);

    List<Booking> findPatientBookings(UUID patientUserId);

    Booking save(Booking booking);
}
