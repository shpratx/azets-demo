package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** ALM authorisation status. Users are suspended, never deleted (UF-12). */
public enum UserStatus implements WireEnum {
    ACTIVE("Active"),
    SUSPENDED("Suspended"),
    PENDING("Pending");

    private final String wire;

    UserStatus(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static UserStatus fromWire(String value) {
        for (UserStatus v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown UserStatus: " + value);
    }
}
