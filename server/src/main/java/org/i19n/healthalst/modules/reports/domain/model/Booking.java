package org.i19n.healthalst.modules.reports.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.i19n.healthalst.shared.BaseEntity;
import org.i19n.healthalst.modules.access.domain.model.Organization;
import org.i19n.healthalst.modules.reports.domain.BookingStatus;

/** Owns the appointment identity to which a report must be attached. */
@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
public class Booking extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "patient_user_id", nullable = false)
    private UUID patientUserId;

    @Column(name = "patient_name", nullable = false, length = 160)
    private String patientName;

    @Column(name = "exam_type", nullable = false, length = 160)
    private String examType;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false, length = 30)
    private BookingStatus bookingStatus;

    @Column(name = "scheduled_time")
    private Instant scheduledTime;
}
