package org.i19n.healthalst.modules.notifications.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.i19n.healthalst.shared.BaseEntity;

/** Durable recipient-owned notification; SSE is only a signal to refetch this state. */
@Entity
@Table(name = "user_notifications")
@Getter
@Setter
@NoArgsConstructor
public class UserNotification extends BaseEntity {
    @Column(name = "organization_id")
    private UUID organizationId;
    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId;
    @Column(name = "notification_type", nullable = false, length = 40)
    private String type;
    @Column(nullable = false, length = 180)
    private String title;
    @Column(nullable = false, length = 500)
    private String body;
    @Column(name = "resource_type", length = 40)
    private String resourceType;
    @Column(name = "resource_id")
    private UUID resourceId;
    @Column(name = "read_at")
    private Instant readAt;
}
