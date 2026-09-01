package com.azets.alm.common.event;

import com.azets.alm.common.web.CorrelationId;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * The bus envelope. eventId exists so consumers can de-duplicate: delivery is at-least-once,
 * and consumers key on event id (LLD 10).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AlmEvent(
        String eventId,
        String type,
        Instant occurredAt,
        String subjectId,
        UUID tenantId,
        String actor,
        String correlationId,
        Map<String, Object> payload) {

    public static AlmEvent of(String type, String subjectId, UUID tenantId, String actor,
                              Map<String, Object> payload) {
        return new AlmEvent(
                UUID.randomUUID().toString(),
                type,
                Instant.now(),
                subjectId,
                tenantId,
                actor,
                CorrelationId.get(),
                payload == null ? Map.of() : payload);
    }

    /** Convenience for events raised by a service rather than a user, LLD 1.8 actor convention. */
    public static AlmEvent bySystem(String type, String service, String subjectId, UUID tenantId,
                                    Map<String, Object> payload) {
        return of(type, subjectId, tenantId, "system:" + service, payload);
    }
}
