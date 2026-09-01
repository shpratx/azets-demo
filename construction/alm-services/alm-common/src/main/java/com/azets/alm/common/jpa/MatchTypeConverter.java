package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.MatchType;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MatchTypeConverter extends WireEnumConverter<MatchType> {
    public MatchTypeConverter() {
        super(MatchType::fromWire);
    }
}
