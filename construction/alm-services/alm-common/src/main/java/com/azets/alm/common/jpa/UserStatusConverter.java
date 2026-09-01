package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.UserStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserStatusConverter extends WireEnumConverter<UserStatus> {
    public UserStatusConverter() {
        super(UserStatus::fromWire);
    }
}
