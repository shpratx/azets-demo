package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Validation issue severity. Error blocks progression, Warning does not (LLD 2.4). */
public enum Severity implements WireEnum {
    WARNING("Warning"),
    ERROR("Error");

    private final String wire;

    Severity(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static Severity fromWire(String value) {
        for (Severity v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown Severity: " + value);
    }
}
