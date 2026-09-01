package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.Resolution;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ResolutionConverter extends WireEnumConverter<Resolution> {
    public ResolutionConverter() {
        super(Resolution::fromWire);
    }
}
