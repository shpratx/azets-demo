package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.RuleStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RuleStatusConverter extends WireEnumConverter<RuleStatus> {
    public RuleStatusConverter() {
        super(RuleStatus::fromWire);
    }
}
