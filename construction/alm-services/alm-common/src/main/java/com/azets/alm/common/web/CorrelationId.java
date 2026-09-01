package com.azets.alm.common.web;

import org.slf4j.MDC;

import java.util.UUID;

/**
 * One correlation id travels the whole journey: accepted at the gateway or minted there,
 * propagated on every service call and bus message, and stamped on every log line and audit
 * event (AP-7.2, LLD 11).
 */
public final class CorrelationId {

    public static final String HEADER = "X-Correlation-Id";
    public static final String MDC_KEY = "correlationId";

    private CorrelationId() {
    }

    public static String get() {
        String value = MDC.get(MDC_KEY);
        return value == null ? "unknown" : value;
    }

    public static void set(String value) {
        MDC.put(MDC_KEY, value);
    }

    public static void clear() {
        MDC.remove(MDC_KEY);
    }

    public static String mint() {
        return UUID.randomUUID().toString();
    }
}
