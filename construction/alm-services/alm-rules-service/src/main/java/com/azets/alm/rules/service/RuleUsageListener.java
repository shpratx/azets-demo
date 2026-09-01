package com.azets.alm.rules.service;

import com.azets.alm.common.event.AlmEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

/**
 * Applies the usedCount increment asynchronously. The counter is evidence for pruning dead rules
 * (UF-11) and is not worth a synchronous write per matched row on the mapping critical path.
 */
@Component
@ConditionalOnProperty(name = "alm.events.transport", havingValue = "kafka", matchIfMissing = true)
public class RuleUsageListener {

    private static final Logger log = LoggerFactory.getLogger(RuleUsageListener.class);

    private final RuleService rules;

    public RuleUsageListener(RuleService rules) {
        this.rules = rules;
    }

    @KafkaListener(topics = "rule.matched", containerFactory = "almKafkaListenerContainerFactory")
    public void onRuleMatched(AlmEvent event, Acknowledgment ack) {
        try {
            Object ruleId = event.payload().get("ruleId");
            Object matches = event.payload().get("matches");
            if (ruleId != null && matches instanceof Number n) {
                rules.applyUsage(ruleId.toString(), n.longValue());
            }
            ack.acknowledge();
        } catch (RuntimeException ex) {
            log.error("rule_usage_apply_failed eventId={} correlationId={}",
                    event.eventId(), event.correlationId(), ex);
            ack.acknowledge();
        }
    }
}
