package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.LedgerAccountStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class LedgerAccountStatusConverter extends WireEnumConverter<LedgerAccountStatus> {
    public LedgerAccountStatusConverter() {
        super(LedgerAccountStatus::fromWire);
    }
}
