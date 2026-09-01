package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** The four roles of the HLD 7.1 RBAC matrix. Auditor is read-only by construction. */
public enum Role implements WireEnum {
    FINANCE_MANAGER("FinanceManager"),
    ACCOUNTANT("Accountant"),
    AUDITOR("Auditor"),
    ADMINISTRATOR("Administrator");

    private final String wire;

    Role(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static Role fromWire(String value) {
        for (Role r : values()) {
            if (r.wire.equalsIgnoreCase(value) || r.name().equalsIgnoreCase(value)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + value);
    }

    /** Spring Security authority form, e.g. ROLE_FinanceManager. */
    public String authority() {
        return "ROLE_" + wire;
    }
}
