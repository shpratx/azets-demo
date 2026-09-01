package com.azets.alm.rules.api.dto;

import com.azets.alm.common.enums.RuleStatus;
import com.azets.alm.rules.domain.MappingRule;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class RuleDtos {

    private RuleDtos() {
    }

    public record RuleResponse(
            String id, int priority, String name, String condition, String action,
            double confidenceBoost, RuleStatus status, long usedCount, int version,
            String createdBy, Instant createdAt) {

        public static RuleResponse from(MappingRule r) {
            return new RuleResponse(r.getId(), r.getPriority(), r.getName(), r.getCondition(),
                    r.getAction(), r.getConfidenceBoost(), r.getStatus(), r.getUsedCount(),
                    r.getVersion(), r.getCreatedBy(), r.getCreatedAt());
        }
    }

    public record RuleInput(
            @NotBlank @Size(max = 200) String name,
            @Min(1) int priority,
            @NotBlank String condition,
            @NotBlank String action,
            double confidenceBoost) {
    }

    /** The five fields addressable by the DSL (LLD 3.1). */
    public record EvaluationAccount(
            String id, String legacyCode, String legacyName,
            String accountType, String parentCode, String currency) {
    }

    public record EvaluationRequest(
            @NotBlank String ledgerVersion,
            @NotNull List<EvaluationAccount> accounts,
            /* Active master codes for the pinned version, supplied by the caller so that the
               rules engine stays stateless and holds no ledger of its own (AP-1.4). */
            List<String> activeMasterCodes) {
    }

    public record RuleEvaluationResult(
            String accountId, boolean matched, boolean systemError, String masterCode,
            String ruleId, double baseConfidence, double confidenceBoost, String explanation) {

        public static RuleEvaluationResult noMatch(String accountId) {
            return new RuleEvaluationResult(accountId, false, false, null, null, 0, 0,
                    "No active rule matched this account");
        }
    }

    public record EvaluationResponse(List<RuleEvaluationResult> results) {
    }

    public record SimulationRequest(@NotBlank String sessionId,
                                    List<EvaluationAccount> accounts,
                                    List<RuleInput> candidateRules,
                                    List<String> activeMasterCodes) {
    }

    public record SimulationResult(
            String sessionId, int accountsEvaluated, int matchedByCandidate, int matchedByLive,
            int newlyMatched, int noLongerMatched, int changedTarget,
            Map<String, Integer> perRuleMatches) {
    }
}
