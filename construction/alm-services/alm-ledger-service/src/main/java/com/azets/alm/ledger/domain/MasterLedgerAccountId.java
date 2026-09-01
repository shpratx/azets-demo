package com.azets.alm.ledger.domain;

import java.io.Serializable;
import java.util.Objects;

/** Composite key (code, ledgerVersion). */
public class MasterLedgerAccountId implements Serializable {

    private String code;
    private String ledgerVersion;

    public MasterLedgerAccountId() {
    }

    public MasterLedgerAccountId(String code, String ledgerVersion) {
        this.code = code;
        this.ledgerVersion = ledgerVersion;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MasterLedgerAccountId other)) {
            return false;
        }
        return Objects.equals(code, other.code) && Objects.equals(ledgerVersion, other.ledgerVersion);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code, ledgerVersion);
    }
}
