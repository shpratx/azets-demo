package com.azets.alm.ledger.api.dto;

import com.azets.alm.common.enums.AccountType;
import com.azets.alm.common.enums.LedgerAccountStatus;
import com.azets.alm.ledger.domain.LedgerVersion;
import com.azets.alm.ledger.domain.MasterLedgerAccount;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

/** Wire DTOs for the ledger API. camelCase on the wire, snake_case in persistence (LLD conventions). */
public final class LedgerDtos {

    private LedgerDtos() {
    }

    public record MasterLedgerAccountResponse(
            String code,
            String ledgerVersion,
            String name,
            String classification,
            AccountType type,
            String parentCode,
            LedgerAccountStatus status,
            Instant lastModified) {

        public static MasterLedgerAccountResponse from(MasterLedgerAccount a) {
            return new MasterLedgerAccountResponse(
                    a.getCode(), a.getLedgerVersion(), a.getName(), a.getClassification(),
                    a.getType(), a.getParentCode(), a.getStatus(), a.getLastModified());
        }
    }

    public record MasterLedgerAccountInput(
            @NotBlank @Size(max = 50) String code,
            @NotBlank @Size(max = 300) String name,
            @Size(max = 200) String classification,
            @NotNull AccountType type,
            @Size(max = 50) String parentCode) {
    }

    public record LedgerVersionResponse(
            String version,
            Instant createdAt,
            String createdBy,
            int accountCount,
            boolean current,
            String note) {

        public static LedgerVersionResponse from(LedgerVersion v) {
            return new LedgerVersionResponse(v.getVersion(), v.getCreatedAt(), v.getCreatedBy(),
                    v.getAccountCount(), v.isCurrent(), v.getNote());
        }
    }

    public record LedgerIndexResponse(String ledgerVersion, List<MasterLedgerAccountResponse> accounts) {
    }

    /** Deactivation names the sessions it affects, so the administrator sees impact before confirming. */
    public record DeactivationResponse(MasterLedgerAccountResponse account, List<String> affectedSessions) {
    }
}
