-- Laboratory journey lifecycle: booking statuses, scheduled time, location.

ALTER TABLE organizations
    ADD COLUMN location VARCHAR(180);

ALTER TABLE bookings
    ADD COLUMN scheduled_time TIMESTAMP WITH TIME ZONE;

ALTER TABLE bookings
    ADD CONSTRAINT ck_bookings_booking_status
    CHECK (booking_status IN ('REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'));

ALTER TABLE bookings
    DROP COLUMN imaging_center;

CREATE INDEX idx_bookings_org_status_date
    ON bookings (organization_id, booking_status, booking_date DESC, id DESC);