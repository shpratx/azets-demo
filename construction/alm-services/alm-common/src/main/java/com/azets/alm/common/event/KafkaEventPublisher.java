package com.azets.alm.common.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Partitions by subject id so that all events for one session land on one partition and are
 * therefore ordered relative to each other - which the session state machine relies on.
 */
@Component
@ConditionalOnProperty(name = "alm.events.transport", havingValue = "kafka", matchIfMissing = true)
public class KafkaEventPublisher implements EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(KafkaEventPublisher.class);

    private final KafkaTemplate<String, AlmEvent> kafkaTemplate;

    public KafkaEventPublisher(KafkaTemplate<String, AlmEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public void publish(AlmEvent event) {
        kafkaTemplate.send(event.type(), event.subjectId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("event_publish_failed type={} subject={} correlationId={}",
                                event.type(), event.subjectId(), event.correlationId(), ex);
                    } else {
                        log.debug("event_published type={} subject={} correlationId={}",
                                event.type(), event.subjectId(), event.correlationId());
                    }
                });
    }
}
