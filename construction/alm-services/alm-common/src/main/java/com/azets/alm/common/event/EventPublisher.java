package com.azets.alm.common.event;

/**
 * Publication boundary. Kept as an interface so services depend on the contract, not on Kafka -
 * the broker is a physical choice and must stay swappable (AP-0.1, AP-10.2).
 */
public interface EventPublisher {
    void publish(AlmEvent event);
}
