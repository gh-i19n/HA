package org.i19n.healthalst.modules.notifications.application;

import java.util.UUID;

/** Transport-neutral post-commit nudge adapted from Eventorch. */
public record RealtimeSignal(UUID organizationId, UUID recipientId, String topic, UUID resourceId) {}
