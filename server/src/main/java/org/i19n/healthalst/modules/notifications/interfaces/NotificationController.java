package org.i19n.healthalst.modules.notifications.interfaces;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.AuthenticatedUser;
import org.i19n.healthalst.modules.notifications.application.NotificationService;
import org.i19n.healthalst.modules.notifications.infrastructure.SseEmitterRegistry;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Durable notification inbox and authenticated same-session SSE stream. */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;
    private final SseEmitterRegistry emitters;

    @GetMapping
    public NotificationService.Inbox inbox(@AuthenticationPrincipal AuthenticatedUser actor) {
        return service.inbox(actor);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> read(@AuthenticationPrincipal AuthenticatedUser actor, @PathVariable UUID id) {
        service.markRead(actor, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> readAll(@AuthenticationPrincipal AuthenticatedUser actor) {
        service.markAllRead(actor);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal AuthenticatedUser actor) {
        return emitters.register(actor.organizationId(), actor.id());
    }
}
