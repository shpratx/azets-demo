package com.azets.alm.intake.domain;

import com.azets.alm.common.enums.AccountType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * LLD 1.3. Note what is deliberately absent: there is no unique constraint on
 * (session_id, legacy_code). Duplicates must be storable in order to be reported as Duplicate
 * exceptions - rejecting them at insert would lose the very thing the user needs to see.
 */
@Entity
@Table(name = "legacy_account")
public class LegacyAccount {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "session_id", length = 20, nullable = false)
    private String sessionId;

    @Column(name = "row_number", nullable = false)
    private int rowNumber;

    @Column(name = "legacy_code", length = 50)
    private String legacyCode;

    @Column(name = "legacy_name", length = 300)
    private String legacyName;

    @Column(name = "account_type", length = 50)
    private String accountType;

    @Column(name = "normalised_type", length = 50)
    private AccountType normalisedType;

    @Column(name = "parent_code", length = 50)
    private String parentCode;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "quality_flags", length = 1000, nullable = false)
    private String qualityFlags = "";

    protected LegacyAccount() {
    }

    public LegacyAccount(String sessionId, int rowNumber, String legacyCode, String legacyName,
                         String accountType, String parentCode, String currency) {
        this.sessionId = sessionId;
        this.rowNumber = rowNumber;
        this.legacyCode = legacyCode;
        this.legacyName = legacyName;
        this.accountType = accountType;
        this.parentCode = parentCode;
        this.currency = currency;
    }

    public void applyNormalisation(String legacyCode, String legacyName, AccountType normalisedType,
                                   String parentCode, String currency) {
        this.legacyCode = legacyCode;
        this.legacyName = legacyName;
        this.normalisedType = normalisedType;
        this.parentCode = parentCode;
        this.currency = currency;
    }

    public void addQualityFlag(String flag) {
        List<String> flags = qualityFlagList();
        if (!flags.contains(flag)) {
            flags.add(flag);
            this.qualityFlags = String.join(",", flags);
        }
    }

    public List<String> qualityFlagList() {
        if (qualityFlags == null || qualityFlags.isBlank()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(List.of(qualityFlags.split(",")));
    }

    public UUID getId() {
        return id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public int getRowNumber() {
        return rowNumber;
    }

    public String getLegacyCode() {
        return legacyCode;
    }

    public String getLegacyName() {
        return legacyName;
    }

    public String getAccountType() {
        return accountType;
    }

    public AccountType getNormalisedType() {
        return normalisedType;
    }

    public String getParentCode() {
        return parentCode;
    }

    public String getCurrency() {
        return currency;
    }
}
