package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.Priority;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PriorityConverter extends WireEnumConverter<Priority> {
    public PriorityConverter() {
        super(Priority::fromWire);
    }
}
