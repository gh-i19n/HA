package org.i19n.healthalst.modules.notifications.infrastructure;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.i19n.healthalst.modules.notifications.application.RealtimeSignal;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Tenant-recipient keyed Eventorch emitter registry with heartbeat and cleanup. */
@Component
@EnableScheduling
public class SseEmitterRegistry {
    private static final long TIMEOUT = 30 * 60 * 1000L;
    private final Map<SubscriberKey, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter register(UUID organizationId, UUID userId) {
        SubscriberKey key = new SubscriberKey(organizationId, userId);
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        emitters.computeIfAbsent(key, ignored -> ConcurrentHashMap.newKeySet()).add(emitter);
        Runnable cleanup = () -> remove(key, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(ignored -> cleanup.run());
        try {
            emitter.send(SseEmitter.event().name("connected").data("{}"));
        } catch (IOException exception) {
            cleanup.run();
        }
        return emitter;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void afterCommit(RealtimeSignal signal) {
        SubscriberKey key = new SubscriberKey(signal.organizationId(), signal.recipientId());
        Set<SseEmitter> subscribers = emitters.getOrDefault(key, Set.of());
        for (SseEmitter emitter : subscribers) {
            try {
                emitter.send(SseEmitter.event().data(new SignalPayload(signal.topic(), signal.resourceId())));
            } catch (IOException exception) {
                remove(key, emitter);
            }
        }
    }

    @Scheduled(fixedDelay = 25_000)
    public void heartbeat() {
        emitters.forEach((key, subscribers) -> subscribers.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().comment("ping"));
            } catch (IOException exception) {
                remove(key, emitter);
            }
        }));
    }

    private void remove(SubscriberKey key, SseEmitter emitter) {
        Set<SseEmitter> subscribers = emitters.get(key);
        if (subscribers != null) {
            subscribers.remove(emitter);
            if (subscribers.isEmpty()) emitters.remove(key);
        }
    }

    private record SubscriberKey(UUID organizationId, UUID userId) {}
    private record SignalPayload(String topic, UUID resourceId) {}
}
