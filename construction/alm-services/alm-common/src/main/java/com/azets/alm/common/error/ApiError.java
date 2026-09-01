package com.azets.alm.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * The single error envelope used across every ALM service (LLD 9). Shaped after RFC 7807 with two
 * ALM additions: correlationId, so a user can quote one id to support (UF-13), and a field-level
 * errors array carrying the source row number the user can find in their own file.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        String type,
        String title,
        int status,
        String detail,
        String correlationId,
        List<FieldError> errors) {

    public static final String TYPE_BASE = "https://alm.azets.internal/errors/";

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record FieldError(Integer row, String field, String message) {
        public static FieldError of(String field, String message) {
            return new FieldError(null, field, message);
        }

        public static FieldError atRow(int row, String field, String message) {
            return new FieldError(row, field, message);
        }
    }
}
