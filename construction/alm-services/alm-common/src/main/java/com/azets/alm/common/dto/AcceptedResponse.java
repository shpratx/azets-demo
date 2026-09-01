package com.azets.alm.common.dto;

/**
 * Returned by operations that are asynchronous by design (upload, mapping, sync, report). The
 * client polls; no progress indicator may claim completion before the server reports it
 * (LLD 8.3, UF-02).
 */
public record AcceptedResponse(String id, String status, String pollUrl, String message) {
}
