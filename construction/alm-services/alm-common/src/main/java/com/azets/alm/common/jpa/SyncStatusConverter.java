package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.SyncStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SyncStatusConverter extends WireEnumConverter<SyncStatus> {
    public SyncStatusConverter() {
        super(SyncStatus::fromWire);
    }
}
