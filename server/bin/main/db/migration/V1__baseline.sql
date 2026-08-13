CREATE TABLE application_metadata (
    id UUID PRIMARY KEY,
    metadata_key VARCHAR(100) NOT NULL UNIQUE,
    metadata_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO application_metadata (id, metadata_key, metadata_value)
VALUES ('00000000-0000-0000-0000-000000000001', 'schema_version', '1');

