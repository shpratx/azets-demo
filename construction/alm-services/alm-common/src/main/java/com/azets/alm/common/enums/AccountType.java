package com.azets.alm.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum AccountType implements WireEnum {
    ASSET("Asset"),
    LIABILITY("Liability"),
    EQUITY("Equity"),
    REVENUE("Revenue"),
    EXPENSE("Expense"),
    MEMO("Memo");

    private final String wire;

    AccountType(String wire) {
        this.wire = wire;
    }

    @Override
    @JsonValue
    public String wire() {
        return wire;
    }

    @JsonCreator
    public static AccountType fromWire(String value) {
        for (AccountType t : values()) {
            if (t.wire.equalsIgnoreCase(value) || t.name().equalsIgnoreCase(value)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Unknown account type: " + value);
    }

    /**
     * Normalisation of the raw source vocabulary (F1.2.2). Returns null when the value cannot be
     * classified, which seeds an "Account type could not be classified" warning per LLD 2.4.
     */
    public static AccountType normalise(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String v = raw.trim().toLowerCase(Locale.ROOT);
        return switch (v) {
            case "asset", "assets", "fixed asset", "current asset", "a" -> ASSET;
            case "liability", "liabilities", "current liability", "l" -> LIABILITY;
            case "equity", "capital", "reserves", "e" -> EQUITY;
            case "revenue", "income", "sales", "turnover", "r" -> REVENUE;
            case "expense", "expenses", "cost", "costs", "overhead", "x" -> EXPENSE;
            case "memo", "memorandum", "statistical", "m" -> MEMO;
            default -> null;
        };
    }
}
