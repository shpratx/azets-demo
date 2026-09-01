package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.SuggestionState;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SuggestionStateConverter extends WireEnumConverter<SuggestionState> {
    public SuggestionStateConverter() {
        super(SuggestionState::fromWire);
    }
}
