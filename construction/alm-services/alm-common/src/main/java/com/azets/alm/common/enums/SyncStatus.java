package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Cozone export outcome. Partial is a first-class state and is never reported as Success (LLD 6.1). */
public enum SyncStatus implements WireEnum {
    SUCCESS("Success"),
    PARTIAL("Partial"),
    FAILED("Failed");

    private final String wire;

    SyncStatus(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static SyncStatus fromWire(String value) {
        for (SyncStatus v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown SyncStatus: " + value);
    }
}
