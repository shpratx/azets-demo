package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.WireEnum;
import jakarta.persistence.AttributeConverter;

import java.util.function.Function;

/**
 * Persists the wire value rather than the Java constant name, so the database column reads as
 * the LLD 1.2 enumeration does ("Rule-Based", not "RULE_BASED") and the CHECK constraints in the
 * Flyway migrations can enforce closure directly.
 */
public abstract class WireEnumConverter<E extends Enum<E> & WireEnum>
        implements AttributeConverter<E, String> {

    private final Function<String, E> fromWire;

    protected WireEnumConverter(Function<String, E> fromWire) {
        this.fromWire = fromWire;
    }

    @Override
    public String convertToDatabaseColumn(E attribute) {
        return attribute == null ? null : attribute.wire();
    }

    @Override
    public E convertToEntityAttribute(String dbData) {
        return dbData == null ? null : fromWire.apply(dbData);
    }
}
