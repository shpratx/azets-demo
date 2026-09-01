package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Exception queue priority; drives the default sort and the SLA clock (F2.4.4). */
public enum Priority implements WireEnum {
    HIGH("High"),
    MEDIUM("Medium"),
    LOW("Low");

    private final String wire;

    Priority(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static Priority fromWire(String value) {
        for (Priority v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown Priority: " + value);
    }
}
