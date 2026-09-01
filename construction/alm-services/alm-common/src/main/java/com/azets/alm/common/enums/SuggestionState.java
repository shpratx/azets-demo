package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Lifecycle of a single mapping decision (LLD 1.4). */
public enum SuggestionState implements WireEnum {
    PENDING("Pending"),
    ACCEPTED("Accepted"),
    OVERRIDDEN("Overridden"),
    FLAGGED("Flagged");

    private final String wire;

    SuggestionState(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static SuggestionState fromWire(String value) {
        for (SuggestionState v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown SuggestionState: " + value);
    }
}
