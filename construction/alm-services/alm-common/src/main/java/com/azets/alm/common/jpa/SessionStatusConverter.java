package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.SessionStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SessionStatusConverter extends WireEnumConverter<SessionStatus> {
    public SessionStatusConverter() {
        super(SessionStatus::fromWire);
    }
}
