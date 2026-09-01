package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.Severity;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SeverityConverter extends WireEnumConverter<Severity> {
    public SeverityConverter() {
        super(Severity::fromWire);
    }
}
