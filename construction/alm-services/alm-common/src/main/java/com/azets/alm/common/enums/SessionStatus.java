package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Mapping session lifecycle. HLD 4 defines the legal transitions; any other transition
 * attempt is rejected with 409 Conflict.
 */
public enum SessionStatus implements WireEnum {
    UPLOADING("Uploading"),
    VALIDATING("Validating"),
    MAPPING("Mapping"),
    IN_REVIEW("InReview"),
    APPROVED("Approved"),
    SYNCING("Syncing"),
    SYNCED("Synced"),
    FAILED("Failed");

    private final String wire;

    SessionStatus(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static SessionStatus fromWire(String value) {
        for (SessionStatus s : values()) {
            if (s.wire.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown session status: " + value);
    }

    /**
     * Legal transitions, HLD 4. Failed may return to a prior state on manual retry, which is
     * handled explicitly by the retry path rather than being enumerated here.
     */
    private static final Map<SessionStatus, Set<SessionStatus>> LEGAL = Map.of(
            UPLOADING, EnumSet.of(VALIDATING, FAILED),
            VALIDATING, EnumSet.of(MAPPING, FAILED),
            MAPPING, EnumSet.of(IN_REVIEW, APPROVED, FAILED),
            IN_REVIEW, EnumSet.of(APPROVED, FAILED),
            APPROVED, EnumSet.of(SYNCING),
            SYNCING, EnumSet.of(SYNCED, FAILED),
            SYNCED, EnumSet.noneOf(SessionStatus.class),
            FAILED, EnumSet.of(UPLOADING, VALIDATING, MAPPING, IN_REVIEW, APPROVED, SYNCING));

    public boolean canTransitionTo(SessionStatus target) {
        return LEGAL.getOrDefault(this, EnumSet.noneOf(SessionStatus.class)).contains(target);
    }

    public boolean isTerminal() {
        return this == SYNCED;
    }

    /** Statuses during which the UI polls for server-reported progress (LLD 8.3). */
    public boolean isInFlight() {
        return this == UPLOADING || this == VALIDATING || this == MAPPING || this == SYNCING;
    }
}
