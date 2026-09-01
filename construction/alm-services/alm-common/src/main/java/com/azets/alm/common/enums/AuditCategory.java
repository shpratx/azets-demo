package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Audit event taxonomy (HLD 5.6). */
public enum AuditCategory implements WireEnum {
    UPLOAD("Upload"),
    VALIDATION("Validation"),
    MAPPING("Mapping"),
    OVERRIDE("Override"),
    APPROVAL("Approval"),
    SYNC("Sync"),
    REPORT("Report"),
    ACCESS("Access");

    private final String wire;

    AuditCategory(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static AuditCategory fromWire(String value) {
        for (AuditCategory v : values()) {
            if (v.wire.equalsIgnoreCase(value) || v.name().equalsIgnoreCase(value)) {
                return v;
            }
        }
        throw new IllegalArgumentException("Unknown AuditCategory: " + value);
    }
}
