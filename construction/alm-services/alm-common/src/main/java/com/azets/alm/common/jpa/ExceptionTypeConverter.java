package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.ExceptionType;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ExceptionTypeConverter extends WireEnumConverter<ExceptionType> {
    public ExceptionTypeConverter() {
        super(ExceptionType::fromWire);
    }
}
