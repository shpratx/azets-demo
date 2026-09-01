package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Resolution strategy that produced a suggestion. Strategy priority for arbitration tie-break is Rule-Based 1, AI Semantic 2, Similarity 3 (LLD 4.2). */
public enum MatchType implements WireEnum {
    RULE_BASED("Rule-Based"),
    AI_SEMANTIC("AI Semantic"),
    SIMILARITY("Similarity");

    private final String wire;

    MatchType(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static MatchType fromWire(String value) {
        for (MatchType v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown MatchType: " + value);
    }

    /** Arbitration tie-break ordering, LLD 4.2. Lower wins. */
    public int strategyPriority() {
        return switch (this) {
            case RULE_BASED -> 1;
            case AI_SEMANTIC -> 2;
            case SIMILARITY -> 3;
        };
    }
}
