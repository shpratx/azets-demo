package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Why an account was routed to human review (HLD 5.4). */
public enum ExceptionType implements WireEnum {
    AMBIGUOUS_MAPPING("Ambiguous Mapping"),
    MISSING_CODE("Missing Code"),
    DUPLICATE("Duplicate"),
    NO_MATCH("No Match"),
    SYSTEM_ERROR("System Error");

    private final String wire;

    ExceptionType(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static ExceptionType fromWire(String value) {
        for (ExceptionType v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown ExceptionType: " + value);
    }
}
