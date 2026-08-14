CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(160) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STAFF', 'PATIENT')),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users (id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_sessions_active ON sessions (token_hash, expires_at);

CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    patient_user_id UUID NOT NULL REFERENCES users (id),
    patient_name VARCHAR(160) NOT NULL,
    imaging_center VARCHAR(160) NOT NULL,
    exam_type VARCHAR(160) NOT NULL,
    booking_date DATE NOT NULL,
    booking_status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_bookings_patient_date ON bookings (patient_user_id, booking_date DESC);

CREATE TABLE reports (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings (id),
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(120) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    content BYTEA NOT NULL,
    report_status VARCHAR(20) NOT NULL CHECK (report_status IN ('PENDING', 'AVAILABLE')),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_reports_uploaded ON reports (uploaded_at DESC, id DESC);
CREATE INDEX idx_reports_patient_status ON reports (report_status, uploaded_at DESC, id DESC);
