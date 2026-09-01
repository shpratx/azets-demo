package com.azets.alm.common.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Local and test transport. Environment differences are configuration, not code branches
 * (AP-7.3) - selecting this publisher is a property, and no service is aware of the choice.
 */
@Component
@ConditionalOnProperty(name = "alm.events.transport", havingValue = "log")
public class LoggingEventPublisher implements EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(LoggingEventPublisher.class);

    @Override
    public void publish(AlmEvent event) {
        log.info("event type={} subject={} actor={} correlationId={} payloadKeys={}",
                event.type(), event.subjectId(), event.actor(), event.correlationId(),
                event.payload().keySet());
    }
}
