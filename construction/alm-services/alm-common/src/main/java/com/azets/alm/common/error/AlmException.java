package com.azets.alm.common.error;

import org.springframework.http.HttpStatus;

import java.util.List;

/**
 * Base of the ALM exception hierarchy. Each subclass fixes the status code so that the mapping
 * from business condition to HTTP status stays in one place, per the LLD 9 status table.
 */
public abstract class AlmException extends RuntimeException {

    private final HttpStatus status;
    private final String typeSlug;
    private final transient List<ApiError.FieldError> fieldErrors;

    protected AlmException(HttpStatus status, String typeSlug, String message) {
        this(status, typeSlug, message, List.of());
    }

    protected AlmException(HttpStatus status, String typeSlug, String message,
                           List<ApiError.FieldError> fieldErrors) {
        super(message);
        this.status = status;
        this.typeSlug = typeSlug;
        this.fieldErrors = fieldErrors == null ? List.of() : List.copyOf(fieldErrors);
    }

    public HttpStatus status() {
        return status;
    }

    public String typeSlug() {
        return typeSlug;
    }

    public List<ApiError.FieldError> fieldErrors() {
        return fieldErrors;
    }
}
