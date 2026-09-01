package com.azets.alm.common.jpa;

import com.azets.alm.common.enums.AccountType;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AccountTypeConverter extends WireEnumConverter<AccountType> {
    public AccountTypeConverter() {
        super(AccountType::fromWire);
    }
}
