package com.azets.alm.rules.service;

import com.azets.alm.common.enums.RuleStatus;
import com.azets.alm.common.error.Exceptions;
import com.azets.alm.common.event.AlmEvent;
import com.azets.alm.common.event.AlmTopics;
import com.azets.alm.common.event.EventPublisher;
import com.azets.alm.common.security.AlmPrincipal;
import com.azets.alm.rules.api.dto.RuleDtos.EvaluationAccount;
import com.azets.alm.rules.api.dto.RuleDtos.RuleEvaluationResult;
import com.azets.alm.rules.api.dto.RuleDtos.RuleInput;
import com.azets.alm.rules.api.dto.RuleDtos.SimulationResult;
import com.azets.alm.rules.domain.MappingRule;
import com.azets.alm.rules.dsl.ConditionParser;
import com.azets.alm.rules.repository.MappingRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class RuleService {

    private final MappingRuleRepository rules;
    private final RuleEvaluator evaluator;
    private final EventPublisher events;

    public RuleService(MappingRuleRepository rules, RuleEvaluator evaluator, EventPublisher events) {
        this.rules = rules;
        this.evaluator = evaluator;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<MappingRule> list(UUID tenantId, RuleStatus status) {
        return status == null
                ? rules.findByTenantIdOrderByPriorityAsc(tenantId)
                : rules.findByTenantIdAndStatusOrderByPriorityAsc(tenantId, status);
    }

    @Transactional(readOnly = true)
    public MappingRule get(UUID tenantId, String id) {
        return rules.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new Exceptions.NotFound("Mapping rule", id));
    }

    /**
     * The condition is parsed here and the rule is only stored if it parses. That is the whole
     * point of validating at save time: the evaluation path never has to consider a malformed
     * rule, and the author gets the error while they still have the context to fix it.
     */
    @Transactional
    public MappingRule create(AlmPrincipal actor, RuleInput in) {
        ConditionParser.validate(in.condition());
        assertPriorityFree(actor.tenantId(), in.priority(), null);
        String id = nextRuleId(actor.tenantId());
        MappingRule rule = new MappingRule(id, actor.tenantId(), in.priority(), in.name(),
                in.condition(), in.action(), in.confidenceBoost(), actor.asActor());
        return rules.save(rule);
    }

    @Transactional
    public MappingRule update(AlmPrincipal actor, String id, RuleInput in) {
        ConditionParser.validate(in.condition());
        MappingRule rule = get(actor.tenantId(), id);
        assertPriorityFree(actor.tenantId(), in.priority(), id);
        rule.update(in.priority(), in.name(), in.condition(), in.action(), in.confidenceBoost());
        return rule;
    }

    @Transactional
    public MappingRule activate(AlmPrincipal actor, String id) {
        MappingRule rule = get(actor.tenantId(), id);
        if (rule.getStatus() == RuleStatus.ACTIVE) {
            throw new Exceptions.Conflict("Rule " + id + " is already active");
        }
        rule.activate();
        publishConfigChange(actor, id, "rule.activated");
        return rule;
    }

    @Transactional
    public MappingRule deprecate(AlmPrincipal actor, String id) {
        MappingRule rule = get(actor.tenantId(), id);
        rule.deprecate();
        publishConfigChange(actor, id, "rule.deprecated");
        return rule;
    }

    @Transactional(readOnly = true)
    public List<RuleEvaluationResult> evaluate(UUID tenantId, List<EvaluationAccount> accounts,
                                               List<String> activeMasterCodes) {
        List<MappingRule> active = rules.findByTenantIdAndStatusOrderByPriorityAsc(tenantId, RuleStatus.ACTIVE);
        Set<String> codes = activeMasterCodes == null ? Set.of() : Set.copyOf(activeMasterCodes);
        List<RuleEvaluationResult> results = evaluator.evaluateBatch(accounts, active, codes);
        publishMatchCounts(tenantId, results);
        return results;
    }

    /**
     * F0.4.5. Runs the same evaluator against a session snapshot with a candidate rule set and
     * writes nothing, so an administrator can see the delta before activating a change. Using the
     * same evaluator rather than a parallel implementation is deliberate - a simulation that does
     * not share the production code path is worth very little.
     */
    @Transactional(readOnly = true)
    public SimulationResult simulate(AlmPrincipal actor, String sessionId,
                                     List<EvaluationAccount> accounts,
                                     List<RuleInput> candidateRules,
                                     List<String> activeMasterCodes) {
        Set<String> codes = activeMasterCodes == null ? Set.of() : Set.copyOf(activeMasterCodes);
        List<MappingRule> live = rules.findByTenantIdAndStatusOrderByPriorityAsc(
                actor.tenantId(), RuleStatus.ACTIVE);

        List<MappingRule> candidate = new ArrayList<>();
        if (candidateRules == null || candidateRules.isEmpty()) {
            candidate.addAll(live);
            candidate.addAll(rules.findByTenantIdAndStatusOrderByPriorityAsc(
                    actor.tenantId(), RuleStatus.DRAFT));
        } else {
            int index = 0;
            for (RuleInput in : candidateRules) {
                ConditionParser.validate(in.condition());
                candidate.add(new MappingRule("SIM-" + (++index), actor.tenantId(), in.priority(),
                        in.name(), in.condition(), in.action(), in.confidenceBoost(), actor.asActor()));
            }
        }
        candidate.sort((a, b) -> Integer.compare(a.getPriority(), b.getPriority()));

        List<RuleEvaluationResult> liveResults = evaluator.evaluateBatch(accounts, live, codes);
        List<RuleEvaluationResult> candidateResults = evaluator.evaluateBatch(accounts, candidate, codes);

        int newlyMatched = 0;
        int noLongerMatched = 0;
        int changedTarget = 0;
        Map<String, Integer> perRule = new HashMap<>();

        for (int i = 0; i < accounts.size(); i++) {
            RuleEvaluationResult before = liveResults.get(i);
            RuleEvaluationResult after = candidateResults.get(i);
            if (!before.matched() && after.matched()) {
                newlyMatched++;
            } else if (before.matched() && !after.matched()) {
                noLongerMatched++;
            } else if (before.matched() && after.matched()
                    && !java.util.Objects.equals(before.masterCode(), after.masterCode())) {
                changedTarget++;
            }
            if (after.matched() && after.ruleId() != null) {
                perRule.merge(after.ruleId(), 1, Integer::sum);
            }
        }

        return new SimulationResult(sessionId, accounts.size(),
                (int) candidateResults.stream().filter(RuleEvaluationResult::matched).count(),
                (int) liveResults.stream().filter(RuleEvaluationResult::matched).count(),
                newlyMatched, noLongerMatched, changedTarget, perRule);
    }

    /** usedCount is incremented from this event, off the evaluation hot path (LLD 1.7). */
    private void publishMatchCounts(UUID tenantId, List<RuleEvaluationResult> results) {
        Map<String, Long> counts = new HashMap<>();
        for (RuleEvaluationResult r : results) {
            if (r.matched() && r.ruleId() != null) {
                counts.merge(r.ruleId(), 1L, Long::sum);
            }
        }
        counts.forEach((ruleId, count) -> events.publish(AlmEvent.bySystem(
                AlmTopics.RULE_MATCHED, "rules-service", ruleId, tenantId,
                Map.of("ruleId", ruleId, "matches", count))));
    }

    @Transactional
    public void applyUsage(String ruleId, long increment) {
        rules.findById(ruleId).ifPresent(r -> r.recordUse(increment));
    }

    private void assertPriorityFree(UUID tenantId, int priority, String excludingId) {
        boolean clash = rules.findByTenantIdOrderByPriorityAsc(tenantId).stream()
                .filter(r -> r.getStatus() != RuleStatus.DEPRECATED)
                .filter(r -> excludingId == null || !r.getId().equals(excludingId))
                .anyMatch(r -> r.getPriority() == priority);
        if (clash) {
            throw new Exceptions.Conflict("Priority " + priority
                    + " is already used by another rule. Priority is unique per tenant because "
                    + "evaluation order is semantically significant.");
        }
    }

    private String nextRuleId(UUID tenantId) {
        return String.format("R-%03d", rules.countByTenantId(tenantId) + 1);
    }

    private void publishConfigChange(AlmPrincipal actor, String ruleId, String action) {
        events.publish(AlmEvent.of(AlmTopics.CONFIG_CHANGED, ruleId, actor.tenantId(),
                actor.asActor(), Map.of("action", action, "ruleId", ruleId)));
    }
}
