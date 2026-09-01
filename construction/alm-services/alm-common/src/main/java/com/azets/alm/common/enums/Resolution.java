package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** How a review record was closed (LLD 1.5). */
public enum Resolution implements WireEnum {
    ACCEPTED("Accepted"),
    OVERRIDDEN("Overridden"),
    ESCALATED("Escalated");

    private final String wire;

    Resolution(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static Resolution fromWire(String value) {
        for (Resolution v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown Resolution: " + value);
    }
}
