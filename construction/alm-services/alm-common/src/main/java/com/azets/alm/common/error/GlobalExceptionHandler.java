package com.azets.alm.common.error;

import com.azets.alm.common.web.CorrelationId;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.List;

/**
 * Renders every failure through the single LLD 9 envelope, so a client never has to parse two
 * error shapes. Server-side logging deliberately records ids and counts only - never legacy
 * account names or file content, which are Confidential under AP-3.4 (LLD 11).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AlmException.class)
    public ResponseEntity<ApiError> handleAlm(AlmException ex, HttpServletRequest request) {
        ApiError body = build(ex.status(), ex.typeSlug(), ex.getMessage(), ex.fieldErrors());
        log.warn("alm_error status={} type={} path={} correlationId={}",
                ex.status().value(), ex.typeSlug(), request.getRequestURI(), CorrelationId.get());

        HttpHeaders headers = new HttpHeaders();
        if (ex instanceof Exceptions.DependencyUnavailable dep) {
            headers.add(HttpHeaders.RETRY_AFTER, String.valueOf(dep.retryAfterSeconds()));
        }
        return new ResponseEntity<>(body, headers, ex.status());
    }

    /** Bean-validation failures are semantic, so 422 rather than 400 (LLD 9). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        List<ApiError.FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> ApiError.FieldError.of(fe.getField(), fe.getDefaultMessage()))
                .toList();
        ApiError body = build(HttpStatus.UNPROCESSABLE_ENTITY, "validation-failed",
                errors.size() + " field(s) failed validation", errors);
        return ResponseEntity.unprocessableEntity().body(body);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleTooLarge(MaxUploadSizeExceededException ex) {
        ApiError body = build(HttpStatus.PAYLOAD_TOO_LARGE, "upload-too-large",
                "Upload exceeds the maximum permitted size", List.of());
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex) {
        ApiError body = build(HttpStatus.FORBIDDEN, "forbidden",
                "Your role does not permit this operation", List.of());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleUnauthenticated(AuthenticationException ex) {
        ApiError body = build(HttpStatus.UNAUTHORIZED, "unauthenticated",
                "Authentication is required", List.of());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        ApiError body = build(HttpStatus.BAD_REQUEST, "malformed-request", ex.getMessage(), List.of());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("unhandled_error path={} correlationId={}",
                request.getRequestURI(), CorrelationId.get(), ex);
        ApiError body = build(HttpStatus.INTERNAL_SERVER_ERROR, "internal-error",
                "An unexpected error occurred. Quote correlation id " + CorrelationId.get()
                        + " when contacting support.", List.of());
        return ResponseEntity.internalServerError().body(body);
    }

    private ApiError build(HttpStatus status, String slug, String detail,
                           List<ApiError.FieldError> errors) {
        return new ApiError(
                ApiError.TYPE_BASE + slug,
                status.getReasonPhrase(),
                status.value(),
                detail,
                CorrelationId.get(),
                errors.isEmpty() ? null : errors);
    }
}
