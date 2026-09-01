package com.azets.alm.rules.dsl;

import com.azets.alm.common.error.Exceptions;

/**
 * A condition that does not parse is rejected at save time and never stored, so the evaluation
 * hot path never has to consider a malformed rule.
 */
public class DslException extends Exceptions.UnprocessableEntity {

    public DslException(String message, int position) {
        super(message + " (at position " + position + ")");
    }

    public DslException(String message) {
        super(message);
    }
}
