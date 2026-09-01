package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Mapping rule lifecycle. Only Active rules are evaluated (LLD 1.7). */
public enum RuleStatus implements WireEnum {
    ACTIVE("Active"),
    DRAFT("Draft"),
    DEPRECATED("Deprecated");

    private final String wire;

    RuleStatus(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static RuleStatus fromWire(String value) {
        for (RuleStatus v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown RuleStatus: " + value);
    }
}
