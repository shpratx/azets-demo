package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.AuditCategory;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AuditCategoryConverter extends WireEnumConverter<AuditCategory> {
    public AuditCategoryConverter() {
        super(AuditCategory::fromWire);
    }
}
