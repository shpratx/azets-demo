package com.azets.alm.common.enums;

/**
 * Enumerations in this platform carry wire values that are not valid Java identifiers
 * ("Rule-Based", "AI Semantic", "Ambiguous Mapping"). LLD 1.2 declares these enumerations
 * closed: adding a member is a breaking change requiring a new API major version (AP-2.3).
 */
public interface WireEnum {
    String wire();
}
