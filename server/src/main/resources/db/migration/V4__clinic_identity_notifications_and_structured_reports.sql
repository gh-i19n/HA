CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(40),
    address VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE users ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN phone VARCHAR(40);
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE users
    ADD CONSTRAINT ck_users_account_status
    CHECK (account_status IN ('ACTIVE', 'SUSPENDED'));

CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations (id),
    user_id UUID NOT NULL REFERENCES users (id),
    role VARCHAR(30) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'REPORT_STAFF')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_organization_membership UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_memberships_user_status
    ON organization_memberships (user_id, status, organization_id);

ALTER TABLE sessions
    ADD COLUMN active_organization_id UUID REFERENCES organizations (id);

CREATE INDEX idx_sessions_user_active_organization
    ON sessions (user_id, active_organization_id, expires_at);

ALTER TABLE bookings
    ADD COLUMN organization_id UUID REFERENCES organizations (id);

CREATE INDEX idx_bookings_organization_date
    ON bookings (organization_id, booking_date DESC, id DESC);

INSERT INTO organizations (id, name, slug, email, phone, address, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000010',
    'Lagos Imaging Centre',
    'lagos-imaging-centre',
    'hello@lagosimaging.local',
    '+234 800 555 0142',
    '12 Marina Road, Lagos Island, Lagos',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

UPDATE bookings
SET organization_id = '00000000-0000-0000-0000-000000000010'
WHERE organization_id IS NULL;

ALTER TABLE bookings ALTER COLUMN organization_id SET NOT NULL;

INSERT INTO organization_memberships (
    id, organization_id, user_id, role, status, created_at, updated_at
)
SELECT
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000010',
    id,
    'OWNER',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users
WHERE id = '00000000-0000-0000-0000-000000000001';

UPDATE sessions
SET active_organization_id = '00000000-0000-0000-0000-000000000010'
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND active_organization_id IS NULL;

ALTER TABLE reports ADD COLUMN template_key VARCHAR(40);
ALTER TABLE reports ADD COLUMN template_version INTEGER;
ALTER TABLE reports ADD COLUMN structured_content JSONB;

ALTER TABLE reports
    ADD CONSTRAINT ck_reports_template_structure
    CHECK (
        (template_key IS NULL AND template_version IS NULL AND structured_content IS NULL)
        OR
        (template_key IN ('CHEST_XRAY', 'MRI_BRAIN') AND template_version IS NOT NULL AND structured_content IS NOT NULL)
    );

CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users (id),
    report_updates BOOLEAN NOT NULL DEFAULT TRUE,
    membership_updates BOOLEAN NOT NULL DEFAULT TRUE,
    email_updates BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE user_notifications (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations (id),
    recipient_id UUID NOT NULL REFERENCES users (id),
    notification_type VARCHAR(40) NOT NULL,
    title VARCHAR(180) NOT NULL,
    body VARCHAR(500) NOT NULL,
    resource_type VARCHAR(40),
    resource_id UUID,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_notifications_recipient_unread
    ON user_notifications (recipient_id, read_at, created_at DESC, id DESC);
CREATE INDEX idx_notifications_tenant_recipient
    ON user_notifications (organization_id, recipient_id, created_at DESC, id DESC);

CREATE TABLE organization_invitations (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations (id),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'REPORT_STAFF')),
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID NOT NULL REFERENCES users (id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_invitations_org_email
    ON organization_invitations (organization_id, email, accepted_at);
