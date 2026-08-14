package org.i19n.healthalst.modules.reports.interfaces.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.i19n.healthalst.modules.reports.domain.BookingStatus;
import org.i19n.healthalst.modules.reports.domain.model.Booking;

/** Stable appointment metadata used by staff and patient views. */
public record BookingResponse(
        UUID id,
        UUID patientId,
        String patientName,
        String patientEmail,
        String organizationName,
        String examType,
        LocalDate bookingDate,
        Instant scheduledTime,
        BookingStatus status
) {

    /** Maps a booking entity to the appointment contract. */
    public static BookingResponse from(Booking booking, String patientEmail) {
        return new BookingResponse(
                booking.getId(), booking.getPatientUserId(), booking.getPatientName(),
                patientEmail,
                booking.getOrganization() == null ? null : booking.getOrganization().getName(),
                booking.getExamType(), booking.getBookingDate(), booking.getScheduledTime(),
                booking.getBookingStatus()
        );
    }
}