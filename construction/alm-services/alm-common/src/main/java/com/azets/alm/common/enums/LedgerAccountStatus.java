package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Master ledger account status. Inactive codes are never suggested (LLD 1.6). */
public enum LedgerAccountStatus implements WireEnum {
    ACTIVE("Active"),
    INACTIVE("Inactive");

    private final String wire;

    LedgerAccountStatus(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static LedgerAccountStatus fromWire(String value) {
        for (LedgerAccountStatus v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown LedgerAccountStatus: " + value);
    }
}
