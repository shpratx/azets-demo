package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.Role;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RoleConverter extends WireEnumConverter<Role> {
    public RoleConverter() {
        super(Role::fromWire);
    }
}
