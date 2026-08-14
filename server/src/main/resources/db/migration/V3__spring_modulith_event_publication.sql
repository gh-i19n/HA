-- Spring Modulith durable event-publication registry.
-- Required by spring-modulith-events-jpa for restart-safe event delivery.
CREATE TABLE event_publication (
    id UUID NOT NULL,
    listener_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    serialized_event TEXT NOT NULL,
    publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completion_date TIMESTAMP WITH TIME ZONE,
    completion_attempts INTEGER NOT NULL DEFAULT 0,
    last_resubmission_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX event_publication_by_completion_date_idx
    ON event_publication (completion_date);

CREATE INDEX event_publication_by_listener_id_idx
    ON event_publication (listener_id);
