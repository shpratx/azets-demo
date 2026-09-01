package com.azets.alm.ai.api.dto;

import com.azets.alm.common.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class AiDtos {

    private AiDtos() {
    }

    public record InferenceAccount(
            String id, String legacyCode, String legacyName,
            AccountType normalisedType, String parentCode) {
    }

    /**
     * The caller supplies the candidate master accounts for the session's pinned ledger version.
     * Keeping the ledger out of this service preserves service autonomy - the AI domain owns
     * models and scoring, not reference data (AP-1.2).
     */
    public record MasterCandidate(String code, String name, String classification, AccountType type) {
    }

    public record SuggestRequest(
            @NotBlank String ledgerVersion,
            Integer topK,
            @NotNull List<InferenceAccount> accounts,
            @NotNull List<MasterCandidate> masterCandidates) {
    }

    public record Candidate(String masterCode, String masterName, double confidence, String explanation) {
    }

    public record AiSuggestionSet(String accountId, List<Candidate> candidates) {
    }

    public record SuggestResponse(String modelVersion, List<AiSuggestionSet> results) {
    }

    public record ModelDescriptor(
            String version, Instant trainedAt, boolean active, String strategy, Map<String, Double> metrics) {
    }
}
