package org.i19n.healthalst.modules.notifications.application;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.AuthenticatedUser;
import org.i19n.healthalst.modules.access.domain.model.UserNotificationPreference;
import org.i19n.healthalst.modules.access.infrastructure.repository.UserNotificationPreferenceRepository;
import org.i19n.healthalst.modules.notifications.domain.UserNotification;
import org.i19n.healthalst.modules.notifications.infrastructure.UserNotificationRepository;
import org.i19n.healthalst.modules.reports.application.ReportNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Persists inbox state and publishes lightweight realtime signals in one transaction. */
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final UserNotificationRepository repository;
    private final UserNotificationPreferenceRepository preferences;
    private final ApplicationEventPublisher events;

    @Transactional
    public void create(
            UUID organizationId,
            UUID recipientId,
            String type,
            String title,
            String body,
            String resourceType,
            UUID resourceId
    ) {
        UserNotification notification = new UserNotification();
        notification.setOrganizationId(organizationId);
        notification.setRecipientId(recipientId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setResourceType(resourceType);
        notification.setResourceId(resourceId);
        repository.save(notification);
        events.publishEvent(new RealtimeSignal(organizationId, recipientId, "notification", resourceId));
    }

    /** Creates a report-lifecycle notification only when the recipient allows report updates. */
    @Transactional
    public void createReportUpdate(
            UUID organizationId,
            UUID recipientId,
            String type,
            String title,
            String body,
            String resourceType,
            UUID resourceId
    ) {
        if (preferences.findByUserId(recipientId).map(UserNotificationPreference::isReportUpdates).orElse(true)) {
            create(organizationId, recipientId, type, title, body, resourceType, resourceId);
        }
    }

    /** Creates a membership notification only when the recipient allows membership updates. */
    @Transactional
    public void createMembershipUpdate(
            UUID organizationId,
            UUID recipientId,
            String type,
            String title,
            String body,
            String resourceType,
            UUID resourceId
    ) {
        if (preferences.findByUserId(recipientId).map(UserNotificationPreference::isMembershipUpdates).orElse(true)) {
            create(organizationId, recipientId, type, title, body, resourceType, resourceId);
        }
    }

    @Transactional(readOnly = true)
    public Inbox inbox(AuthenticatedUser actor) {
        var limit = PageRequest.of(0, 30);
        List<UserNotification> items;
        long unread;
        if (actor.organizationId() == null) {
            items = repository.findByRecipientIdAndOrganizationIdIsNullOrderByCreatedAtDesc(actor.id(), limit);
            unread = repository.countByRecipientIdAndOrganizationIdIsNullAndReadAtIsNull(actor.id());
        } else {
            items = repository.findByRecipientIdAndOrganizationIdOrderByCreatedAtDesc(
                    actor.id(), actor.organizationId(), limit);
            unread = repository.countByRecipientIdAndOrganizationIdAndReadAtIsNull(
                    actor.id(), actor.organizationId());
        }
        return new Inbox(unread, items.stream().map(NotificationItem::from).toList());
    }

    @Transactional
    public void markRead(AuthenticatedUser actor, UUID id) {
        UserNotification notification = repository.findByIdAndRecipientId(id, actor.id())
                .filter(item -> java.util.Objects.equals(item.getOrganizationId(), actor.organizationId()))
                .orElseThrow(() -> new ReportNotFoundException("The notification was not found."));
        notification.setReadAt(Instant.now());
        repository.save(notification);
    }

    @Transactional
    public void markAllRead(AuthenticatedUser actor) {
        inbox(actor).items().stream().filter(item -> item.readAt() == null).forEach(item -> markRead(actor, item.id()));
    }

    public record Inbox(long unreadCount, List<NotificationItem> items) {}
    public record NotificationItem(
            UUID id, String type, String title, String body, String resourceType,
            UUID resourceId, Instant readAt, Instant createdAt
    ) {
        static NotificationItem from(UserNotification value) {
            return new NotificationItem(value.getId(), value.getType(), value.getTitle(), value.getBody(),
                    value.getResourceType(), value.getResourceId(), value.getReadAt(), value.getCreatedAt());
        }
    }
}
