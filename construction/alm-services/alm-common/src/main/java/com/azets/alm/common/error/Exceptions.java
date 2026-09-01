package com.azets.alm.common.error;

import com.azets.alm.common.enums.SessionStatus;
import org.springframework.http.HttpStatus;

import java.util.List;

/**
 * Concrete exception types. Note the deliberate absence of a cross-tenant "forbidden" case:
 * per LLD 9, a tenant-scoped resource the caller may not see returns 404, never 403, so that
 * existence is not disclosed.
 */
public final class Exceptions {

    private Exceptions() {
    }

    /** 404 - unknown resource, or a resource outside the caller's tenant. */
    public static class NotFound extends AlmException {
        public NotFound(String resource, String id) {
            super(HttpStatus.NOT_FOUND, "not-found", resource + " '" + id + "' was not found");
        }
    }

    /** 403 - the caller is authenticated but the role or segregation-of-duties rule denies this. */
    public static class Forbidden extends AlmException {
        public Forbidden(String reason) {
            super(HttpStatus.FORBIDDEN, "forbidden", reason);
        }

        /** AP-4.5: the proposer of an override may never approve it. */
        public static Forbidden segregationOfDuties() {
            return new Forbidden("Segregation of duties: the proposer of an override cannot approve it");
        }
    }

    /** 409 - an illegal state transition or a stale optimistic-locking version. */
    public static class Conflict extends AlmException {
        public Conflict(String message) {
            super(HttpStatus.CONFLICT, "conflict", message);
        }

        public static Conflict illegalTransition(String sessionId, SessionStatus from, SessionStatus to) {
            return new Conflict("Session " + sessionId + " cannot move from "
                    + from.wire() + " to " + to.wire());
        }

        public static Conflict staleVersion(String resource, String id) {
            return new Conflict(resource + " '" + id
                    + "' was modified by another user; reload and retry");
        }

        /** TS-EXC-05: name the resolver rather than surfacing a raw conflict. */
        public static Conflict alreadyResolved(String exceptionId, String resolvedBy) {
            return new Conflict("Exception " + exceptionId + " was already resolved by " + resolvedBy);
        }
    }

    /** 422 - the request parsed correctly but failed a semantic rule. */
    public static class UnprocessableEntity extends AlmException {
        public UnprocessableEntity(String message) {
            super(HttpStatus.UNPROCESSABLE_ENTITY, "validation-failed", message);
        }

        public UnprocessableEntity(String message, List<ApiError.FieldError> errors) {
            super(HttpStatus.UNPROCESSABLE_ENTITY, "validation-failed", message, errors);
        }
    }

    /** 413 - upload exceeds the configured cap; the message names the cap (TS-UPL-05). */
    public static class PayloadTooLarge extends AlmException {
        public PayloadTooLarge(long limitBytes) {
            super(HttpStatus.PAYLOAD_TOO_LARGE, "upload-too-large",
                    "Upload exceeds the maximum permitted size of " + (limitBytes / (1024 * 1024)) + " MB");
        }
    }

    /** 415 - the extension or detected content type is not one of CSV, XLSX, XML (TS-UPL-04). */
    public static class UnsupportedMedia extends AlmException {
        public UnsupportedMedia(String detected) {
            super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "unsupported-format",
                    "Unsupported file format '" + detected + "'. Supported formats are CSV, XLSX and XML");
        }
    }

    /** 503 - a dependency is unavailable; the handler adds Retry-After. */
    public static class DependencyUnavailable extends AlmException {
        private final int retryAfterSeconds;

        public DependencyUnavailable(String dependency, int retryAfterSeconds) {
            super(HttpStatus.SERVICE_UNAVAILABLE, "dependency-unavailable",
                    dependency + " is currently unavailable");
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public int retryAfterSeconds() {
            return retryAfterSeconds;
        }
    }
}
