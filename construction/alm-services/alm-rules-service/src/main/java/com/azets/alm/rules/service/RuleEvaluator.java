package com.azets.alm.rules.service;

import com.azets.alm.rules.api.dto.RuleDtos.EvaluationAccount;
import com.azets.alm.rules.api.dto.RuleDtos.RuleEvaluationResult;
import com.azets.alm.rules.domain.MappingRule;
import com.azets.alm.rules.dsl.Ast;
import com.azets.alm.rules.dsl.ConditionParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The evaluation core of LLD 3.2. Stateless: it holds no session state, and it does not write the
 * usedCount increment inline - that is published as an event and applied asynchronously, keeping
 * the hot path free of a write per matched row (AP-1.4, LLD 1.7).
 *
 * <p>First match wins. Evaluation stops at the highest-priority matching rule, which is why rule
 * ordering is semantically significant and why the Rules screen makes it explicit (UF-11).
 */
@Component
public class RuleEvaluator {

    private static final Logger log = LoggerFactory.getLogger(RuleEvaluator.class);

    /**
     * AST cache keyed by (ruleId, version). Including the version in the key means a rule edit
     * invalidates its own entry without any explicit eviction call - a stale AST cannot be served.
     */
    private final Map<String, Ast> astCache = new ConcurrentHashMap<>();

    @Value("${alm.rules.base-confidence:95}")
    private double ruleBaseConfidence;

    /**
     * @param activeMasterCodes active codes of the session's pinned ledger version. A rule whose
     *                          action targets a code outside this set yields a System Error result
     *                          rather than a silent bad mapping (TS-MAP-18).
     */
    public RuleEvaluationResult evaluate(EvaluationAccount account,
                                         List<MappingRule> activeRulesByPriority,
                                         Set<String> activeMasterCodes) {
        Map<String, String> fields = toFieldMap(account);

        for (MappingRule rule : activeRulesByPriority) {
            Ast ast = astFor(rule);
            if (ast == null) {
                continue;
            }
            if (!ast.test(fields)) {
                continue;
            }

            String target = resolveAction(rule.getAction());
            if (!activeMasterCodes.isEmpty() && !activeMasterCodes.contains(target)) {
                return new RuleEvaluationResult(account.id(), false, true, null, rule.getId(), 0, 0,
                        "Rule " + rule.getId() + " targets master code '" + target
                                + "', which is not active in this ledger version");
            }

            return new RuleEvaluationResult(
                    account.id(),
                    true,
                    false,
                    target,
                    rule.getId(),
                    ruleBaseConfidence,
                    rule.getConfidenceBoost(),
                    "Rule " + rule.getId() + " (" + rule.getName() + ") matched: " + rule.getCondition());
        }
        return RuleEvaluationResult.noMatch(account.id());
    }

    public List<RuleEvaluationResult> evaluateBatch(List<EvaluationAccount> accounts,
                                                    List<MappingRule> activeRulesByPriority,
                                                    Set<String> activeMasterCodes) {
        return accounts.stream()
                .map(a -> evaluate(a, activeRulesByPriority, activeMasterCodes))
                .toList();
    }

    /**
     * A rule whose condition no longer parses is skipped rather than failing the whole run: one
     * bad rule must not stop a firm's ledger from being mapped (AP-6.5). It is logged loudly
     * because it should be impossible - conditions are validated at save time.
     */
    private Ast astFor(MappingRule rule) {
        String key = rule.getId() + ":" + rule.getVersion();
        return astCache.computeIfAbsent(key, k -> {
            try {
                return ConditionParser.parse(rule.getCondition());
            } catch (RuntimeException ex) {
                log.error("rule_condition_unparseable ruleId={} version={} reason={}",
                        rule.getId(), rule.getVersion(), ex.getMessage());
                return null;
            }
        });
    }

    /**
     * The action grammar is intentionally minimal: a literal master code, optionally quoted, or
     * "map to X". Anything richer would reintroduce the arbitrary-expression risk the condition
     * DSL was restricted to avoid.
     */
    private String resolveAction(String action) {
        String a = action.trim();
        if (a.toLowerCase().startsWith("map to ")) {
            a = a.substring("map to ".length()).trim();
        }
        if ((a.startsWith("'") && a.endsWith("'")) || (a.startsWith("\"") && a.endsWith("\""))) {
            a = a.substring(1, a.length() - 1);
        }
        return a;
    }

    private Map<String, String> toFieldMap(EvaluationAccount a) {
        Map<String, String> fields = new HashMap<>();
        fields.put("legacyCode", a.legacyCode());
        fields.put("legacyName", a.legacyName());
        fields.put("accountType", a.accountType());
        fields.put("parentCode", a.parentCode());
        fields.put("currency", a.currency());
        return fields;
    }

    public double baseConfidence() {
        return ruleBaseConfidence;
    }
}
