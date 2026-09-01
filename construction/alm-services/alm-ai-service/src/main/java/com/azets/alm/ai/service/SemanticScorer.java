package com.azets.alm.ai.service;

import com.azets.alm.ai.api.dto.AiDtos.Candidate;
import com.azets.alm.ai.api.dto.AiDtos.InferenceAccount;
import com.azets.alm.ai.api.dto.AiDtos.MasterCandidate;
import com.azets.alm.common.enums.AccountType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Semantic scoring for F1.3.2. The scoring itself is a composite of token-set similarity over
 * account names and a code-affinity signal, with a hard account-type gate.
 *
 * <p>Two design points worth stating explicitly. First, the type gate is a hard exclusion, not a
 * penalty: an Asset legacy account is never offered a Revenue master code, because a
 * type-crossing suggestion is not a near miss - it is wrong in a way a reviewer should never be
 * asked to adjudicate (TS-MAP-12). Second, every candidate carries a generated explanation.
 * The Explainability Framework makes an unexplained suggestion invalid (F0.5.5), so the
 * explanation is produced by the same code that produced the score, not narrated afterwards.
 */
@Component
public class SemanticScorer {

    /** Domain synonyms let a legacy "debtors" match a master "Trade Receivables". */
    private static final List<Set<String>> SYNONYM_GROUPS = List.of(
            Set.of("bank", "cash", "treasury"),
            Set.of("debtor", "debtors", "receivable", "receivables", "ar"),
            Set.of("creditor", "creditors", "payable", "payables", "ap"),
            Set.of("sales", "revenue", "turnover", "income"),
            Set.of("wages", "salaries", "payroll", "staff"),
            Set.of("rent", "lease", "premises"),
            Set.of("vat", "tax", "duty"),
            Set.of("stock", "inventory", "goods"),
            Set.of("depreciation", "amortisation", "amortization"),
            Set.of("motor", "vehicle", "vehicles", "car"));

    private static final Set<String> STOP_WORDS = Set.of(
            "account", "accounts", "the", "and", "of", "a", "an", "other", "misc", "general", "nominal");

    @Value("${alm.ai.base-confidence-ceiling:92}")
    private double confidenceCeiling;

    @Value("${alm.ai.minimum-reportable:20}")
    private double minimumReportable;

    public List<Candidate> score(InferenceAccount account, List<MasterCandidate> masters, int topK) {
        Set<String> legacyTokens = tokenise(account.legacyName());
        List<Candidate> scored = new ArrayList<>();

        for (MasterCandidate master : masters) {
            if (!typeCompatible(account.normalisedType(), master.type())) {
                continue;
            }
            Set<String> masterTokens = tokenise(master.name() + " " + nullToEmpty(master.classification()));

            double nameScore = tokenSetSimilarity(legacyTokens, masterTokens);
            double synonymScore = synonymOverlap(legacyTokens, masterTokens);
            double codeScore = codeAffinity(account.legacyCode(), master.code());
            double typeBonus = account.normalisedType() != null
                    && account.normalisedType() == master.type() ? 0.10 : 0.0;

            double composite = (0.50 * nameScore) + (0.20 * synonymScore)
                    + (0.20 * codeScore) + typeBonus;
            double confidence = round2(Math.min(composite * confidenceCeiling, confidenceCeiling));

            if (confidence < minimumReportable) {
                continue;
            }
            scored.add(new Candidate(master.code(), master.name(), confidence,
                    explain(account, master, nameScore, synonymScore, codeScore, typeBonus > 0)));
        }

        return scored.stream()
                .sorted(Comparator.comparingDouble(Candidate::confidence).reversed()
                        .thenComparing(Candidate::masterCode))
                .limit(Math.max(1, topK))
                .toList();
    }

    /**
     * The gate. A null legacy type cannot be gated on - the source did not tell us - so those
     * accounts remain eligible against every master type and are scored on name and code alone.
     */
    private boolean typeCompatible(AccountType legacyType, AccountType masterType) {
        if (legacyType == null || masterType == null) {
            return true;
        }
        if (legacyType == masterType) {
            return true;
        }
        // Memo accounts are statistical and may legitimately map across types.
        return legacyType == AccountType.MEMO || masterType == AccountType.MEMO;
    }

    private double tokenSetSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) {
            return 0.0;
        }
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return (double) intersection.size() / union.size();
    }

    private double synonymOverlap(Set<String> legacy, Set<String> master) {
        for (Set<String> group : SYNONYM_GROUPS) {
            boolean inLegacy = legacy.stream().anyMatch(group::contains);
            boolean inMaster = master.stream().anyMatch(group::contains);
            if (inLegacy && inMaster) {
                return 1.0;
            }
        }
        return 0.0;
    }

    /**
     * Chart-of-accounts numbering is conventionally hierarchical, so a shared leading digit run
     * is weak but genuine evidence. It is weighted low precisely because it is a convention and
     * not a guarantee.
     */
    private double codeAffinity(String legacyCode, String masterCode) {
        if (legacyCode == null || masterCode == null) {
            return 0.0;
        }
        String a = legacyCode.replaceAll("\\D", "");
        String b = masterCode.replaceAll("\\D", "");
        if (a.isEmpty() || b.isEmpty()) {
            return 0.0;
        }
        int shared = 0;
        int limit = Math.min(a.length(), b.length());
        while (shared < limit && a.charAt(shared) == b.charAt(shared)) {
            shared++;
        }
        return Math.min(1.0, shared / 3.0);
    }

    private String explain(InferenceAccount account, MasterCandidate master,
                           double nameScore, double synonymScore, double codeScore, boolean typeMatch) {
        List<String> reasons = new ArrayList<>();
        if (nameScore > 0.5) {
            reasons.add("account names overlap strongly");
        } else if (nameScore > 0.2) {
            reasons.add("account names partially overlap");
        }
        if (synonymScore > 0) {
            reasons.add("names use equivalent accounting terminology");
        }
        if (codeScore > 0.5) {
            reasons.add("account codes share a leading range");
        }
        if (typeMatch) {
            reasons.add("account types agree (" + account.normalisedType().wire() + ")");
        }
        if (reasons.isEmpty()) {
            reasons.add("weak overall similarity - review recommended");
        }
        return "Semantic match to " + master.code() + " (" + master.name() + "): "
                + String.join(", ", reasons) + ".";
    }

    private Set<String> tokenise(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
                .filter(t -> t.length() > 1)
                .filter(t -> !STOP_WORDS.contains(t))
                .collect(HashSet::new, HashSet::add, HashSet::addAll);
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
