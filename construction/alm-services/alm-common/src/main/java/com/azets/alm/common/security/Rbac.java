package com.azets.alm.common.security;

/**
 * Authority expressions mirroring the HLD 7.1 RBAC matrix, named after the capability rather
 * than the role list, so a matrix change is made in one place. Auditor appears in read
 * expressions only - it has no write capability anywhere in the matrix.
 */
public final class Rbac {

    private Rbac() {
    }

    private static final String FM = "'ROLE_FinanceManager'";
    private static final String ACC = "'ROLE_Accountant'";
    private static final String AUD = "'ROLE_Auditor'";
    private static final String ADM = "'ROLE_Administrator'";

    /** Upload legacy file: FinanceManager, Accountant, Administrator. */
    public static final String CAN_UPLOAD = "hasAnyAuthority(" + FM + ", " + ACC + ", " + ADM + ")";

    /** View mapping suggestions: all four roles, Auditor read-only. */
    public static final String CAN_READ = "hasAnyAuthority(" + FM + ", " + ACC + ", " + AUD + ", " + ADM + ")";

    /** Propose override: FinanceManager, Accountant, Administrator. */
    public static final String CAN_PROPOSE = "hasAnyAuthority(" + FM + ", " + ACC + ", " + ADM + ")";

    /** Approve override, approve session, trigger and retry sync: FinanceManager, Administrator. */
    public static final String CAN_APPROVE = "hasAnyAuthority(" + FM + ", " + ADM + ")";

    /** Edit master ledger, edit rules, manage users: Administrator only. */
    public static final String IS_ADMIN = "hasAuthority(" + ADM + ")";
}
